package master.it_projekt_tablohm.services;

import jakarta.annotation.PreDestroy;
import master.it_projekt_tablohm.models.DisplayTemplateData;
import master.it_projekt_tablohm.repositories.DisplayTemplateDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * Queues OEPL upload requests so the ESP is not overwhelmed by bursts.
 */
@Service
public class OeplUploadQueueService {

    private static final Logger logger = LoggerFactory.getLogger(OeplUploadQueueService.class);

    private final OpenEPaperSyncService oeplSyncService;
    private final DisplayTemplateDataRepository templateDataRepository;
    private final ObjectProvider<TemplateDisplayUpdateService> templateDisplayUpdateServiceProvider;
    private final long delayMillis;
    private final boolean resendOnStart;
    private final BlockingQueue<UploadTask> queue = new LinkedBlockingQueue<>();
    private final ExecutorService worker;

    public OeplUploadQueueService(OpenEPaperSyncService oeplSyncService,
                                  DisplayTemplateDataRepository templateDataRepository,
                                  ObjectProvider<TemplateDisplayUpdateService> templateDisplayUpdateServiceProvider,
                                  @Value("${app.oepl.upload-delay-ms:60000}") long delayMillis,
                                  @Value("${app.oepl.resend-on-start:true}") boolean resendOnStart) {
        this.oeplSyncService = oeplSyncService;
        this.templateDataRepository = templateDataRepository;
        this.templateDisplayUpdateServiceProvider = templateDisplayUpdateServiceProvider;
        this.delayMillis = delayMillis;
        this.resendOnStart = resendOnStart;
        this.worker = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "oepl-upload-queue");
            t.setDaemon(true);
            return t;
        });
        startWorker();
        logger.info("Started OEPL upload queue with delay {} ms between sends", delayMillis);
    }

    // Wraps an upload request into the queue so the single worker can limit the amount of requests to the ESP
    public void enqueue(String filename, String mac) {
        if (filename == null || mac == null) {
            logger.warn("Skipped enqueue because filename or mac was null (filename={}, mac={})", filename, mac);
            return;
        }
        queue.offer(new UploadTask(filename, mac));
        logger.debug("Queued OEPL upload for mac={} file={} (queue size={})", mac, filename, queue.size());
    }

    // On application ready, re-enqueue all active template data so nothing is lost after a restart
    @EventListener(ApplicationReadyEvent.class)
    public void resendPendingOnStartup() {
        if (!resendOnStart) {
            logger.info("Skipping OEPL resend on startup (disabled via config)");
            return;
        }
        TemplateDisplayUpdateService templateDisplayUpdateService = templateDisplayUpdateServiceProvider.getIfAvailable();
        if (templateDisplayUpdateService == null) {
            logger.warn("Skipping OEPL resend on startup because TemplateDisplayUpdateService is unavailable");
            return;
        }

        int scheduled = 0;
        for (DisplayTemplateData data : templateDataRepository.findAll()) {
            if (data.getDisplayMac() == null || data.getTemplateTypeEntity() == null) {
                continue;
            }
            templateDisplayUpdateService.requestUpdate(data);
            scheduled++;
        }
        logger.info("Startup resend enqueued {} display updates for OEPL", scheduled);
    }

    // Single worker thread that drains the queue and sends uploads with delay between items
    private void startWorker() {
        worker.submit(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    UploadTask task = queue.take();
                    logger.debug("Processing OEPL upload for mac={} file={}", task.mac(), task.filename());
                    oeplSyncService.uploadImageToOEPLForDisplay(task.filename(), task.mac());
                    if (delayMillis > 0) {
                        Thread.sleep(delayMillis);
                    }
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    logger.info("Shutting down OEPL upload queue worker");
                } catch (Exception e) {
                    logger.error("Error while processing OEPL upload queue item", e);
                }
            }
        });
    }

    // Interrupt the worker
    @PreDestroy
    public void shutdown() {
        worker.shutdownNow();
    }

    private record UploadTask(String filename, String mac) {
    }
}
