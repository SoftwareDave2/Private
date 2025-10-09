package master.it_projekt_tablohm.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import jakarta.websocket.*;
import master.it_projekt_tablohm.dto.OeplTagDTO;
import master.it_projekt_tablohm.dto.TagTypeDto;
import master.it_projekt_tablohm.helper.SVGToJPEGConverter;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.TimeZone;

@Service
public class OpenEPaperSyncService {

    private static final Logger logger = LoggerFactory.getLogger(OpenEPaperSyncService.class);
    private final DisplayRepository displayRepository;

    // Internal web-socket session within this service
    private Session session;

    // 192.168.2.66
    private static final String OEPL_HOST = "192.168.2.66"; // System.getenv("OEPL_HOST"); 92.168.4.1
    private static final String OEPL_GET_DB_PATH = "/get_db";
    private static final String TAG_TYPE_PATH = "static/tagtypes/";
    private static final String UPLOADS_DIR = System.getProperty("user.dir")
            + File.separator + "src"
            + File.separator + "frontend"
            + File.separator + "public"
            + File.separator + "uploads";

    private boolean initialized = false;

    public OpenEPaperSyncService(DisplayRepository displayRepository) {
        this.displayRepository = displayRepository;
    }

    @Transactional
    @Scheduled(fixedRate = 6000)
    public void initialTagSynchronization() {
        if (!initialized) {
            logger.info("Initially loading oepl data from {}", OEPL_HOST);
            try {
                var tags = oeplGetDb();
                logger.info("Syncing {} oepl tags", tags.size());
                for (var tag : tags) {
                    syncOEPLTagToDB(tag);
                }
                initializeWebSocketConnection();
            } catch (URISyntaxException e) {
                logger.error("Invalid URI. Make sure set the env variable OEPL_HOST correct with no protocol and no trailing /. Aborting...");
                System.exit(1);
            } catch (Exception e) {
                logger.error("Unexpected exception during initial data-sync. Retrying", e);
                return;
            }
            initialized = true;
        }
    }

    List<OeplTagDTO> oeplGetDb() throws URISyntaxException, IOException, InterruptedException {
        var httpClient = HttpClient.newHttpClient();

        // GET request
        var request = HttpRequest.newBuilder()
                .uri(new URI("http://" + OEPL_HOST + OEPL_GET_DB_PATH))
                .header("Accept", "application/json")
                .GET()
                .build();

        // Send request and receive response
        var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        // Check response
        if (response.statusCode() != 200) {
            throw new IOException("Error while trying to receive tags: HTTP "
                    + response.statusCode() + " - Response-Body: " + response.body());
        }

        // Mapping response values to OeplTagDTO
        var mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        JsonNode root = mapper.readTree(response.body());
        var tagArray = root.get("tags");

        // NULL check
        if (tagArray == null || !tagArray.isArray()) {
            throw new IOException("Response doesn't contain a valid tag Array: " + response.body());
        }

        return mapper.readValue(tagArray.toString(), new TypeReference<List<OeplTagDTO>>() {});
    }

    void initializeWebSocketConnection() throws DeploymentException, IOException {
        var container = ContainerProvider.getWebSocketContainer();
        var config = ClientEndpointConfig.Builder.create().build();

        container.connectToServer(new Endpoint() {
            @Override
            public void onOpen(Session session, EndpointConfig config) {
                OpenEPaperSyncService.this.session = session;
                session.addMessageHandler(String.class, msg -> {
                    logger.debug("WS Received: {}", msg);
                    handleMessage(msg);
                });
            }

            @Override
            public void onError(Session session, Throwable thr) {
                logger.error("Websocket error", thr);
            }

            @Override
            public void onClose(Session session, CloseReason closeReason) {
                logger.warn("Websocket closed unexpectedly");
            }
        }, config, URI.create("ws://" + OEPL_HOST + "/ws"));
    }

    void handleMessage(String msg) {
        var mapper = new ObjectMapper();
        try {
            JsonNode node = mapper.readTree(msg);
            if (node.has("tags")) {
                var tags = mapper.readValue(node.get("tags").toString(), new TypeReference<List<OeplTagDTO>>() {});
                for (var tag : tags) {
                    syncOEPLTagToDB(tag);
                    logger.info("Synced tag with mac: {} over ws", tag.getMac());
                }
            }
        } catch (Exception e) {
            logger.error("Error processing web-socket message: {}", msg, e);
        }
    }

    void syncOEPLTagToDB(OeplTagDTO tagDTO) throws URISyntaxException, IOException, InterruptedException {
        // Check if the display is already in the database
        Display display = displayRepository.findByMacAddress(tagDTO.getMac())
                .orElseGet(() -> {
                    Display d = new Display();
                    d.setMacAddress(tagDTO.getMac());
                    d.setFilename(d.getFilename());
                    d.setDisplayTechnology("ESL");
                    return d;
                });

        // Check if tag type is available in resource folder
        var tagType = getTagType(tagDTO.getHwType());
        if (tagType == null) {
            logger.warn("Skipping mac: {} as the tag_type could not be read", tagDTO.getMac());
            return;
        }

        // update values
        // display.setDoSwitch(tagDTO.getPending() != 0);
        display.setDisplayName(tagDTO.getAlias());
        display.setBattery_percentage(mvToPercent(tagDTO.getBatteryMv(), 2200, 3000));
        display.setLastSwitch(fromUnixTimeStamp(tagDTO.getUpdatelast()));
        display.setWidth(tagType.getWidth());
        display.setHeight(tagType.getHeight());
        display.setModel(tagType.getModel());
        display.setNextEventTime(fromUnixTimeStamp(tagDTO.getNextupdate()));
        display.setWakeTime(fromUnixTimeStamp(tagDTO.getNextcheckin()));
        display.setBrand(tagType.getName());
        display.setDoSwitch(true);
        display.setFilename(display.getFilename());
        display.setFilenameApp(display.getFilename());


        //TODO: Add distinction between different Display Types (Raumschild, Türschild, Ereignisse, Hinweise)
        // display.setDisplayType("Türschild");

        displayRepository.save(display);
    }

    TagTypeDto getTagType(int hwType) {
        var fileName = String.format("%02x.json", hwType); // hwType (dec) to hex
        var resourcePath = TAG_TYPE_PATH + fileName;
        try (var inputStream = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            var mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            return mapper.readValue(inputStream, TagTypeDto.class);
        } catch (IOException e) {
            logger.error("Error reading tag_type for hwType {}", hwType, e);
            return null;
        }
    }

    public static int mvToPercent(int mv, int vEmpty, int vFull) {
        if (vFull <= vEmpty) return 0;
        double pct = (mv - vEmpty) * 100.0 / (vFull - vEmpty);
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        return (int) Math.round(pct);
    }

    LocalDateTime fromUnixTimeStamp(long timestamp) {
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(timestamp), TimeZone.getDefault().toZoneId());
    }

    // Upload an JPEG image to an OEPL display
    public void uploadImageToOEPLForDisplay(String filename, String mac) {
        try {

            File imageFile = new File(UPLOADS_DIR + File.separator + filename);
            if (!imageFile.exists()) {
                logger.error("Datei existiert nicht: {}", imageFile.getAbsolutePath());
                return;
            }

            HttpClient client = HttpClient.newHttpClient();
            String boundary = "----Boundary" + System.currentTimeMillis();
            String CRLF = "\r\n";

            var byteStream = new java.io.ByteArrayOutputStream();
            var writer = new java.io.OutputStreamWriter(byteStream, java.nio.charset.StandardCharsets.UTF_8);

            // --- mac
            writer.append("--").append(boundary).append(CRLF);
            writer.append("Content-Disposition: form-data; name=\"mac\"").append(CRLF).append(CRLF);
            writer.append(mac).append(CRLF);

            // --- dither
            writer.append("--").append(boundary).append(CRLF);
            writer.append("Content-Disposition: form-data; name=\"dither\"").append(CRLF).append(CRLF);
            writer.append("0").append(CRLF); // 1 = dithering aktiv

            // --- file
            writer.append("--").append(boundary).append(CRLF);
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                    .append(filename).append("\"").append(CRLF);
            writer.append("Content-Type: image/jpeg").append(CRLF).append(CRLF);
            writer.flush();

            java.nio.file.Files.copy(imageFile.toPath(), byteStream);
            byteStream.write(CRLF.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // End
            writer.append("--").append(boundary).append("--").append(CRLF);
            writer.close();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("http://" + OEPL_HOST + "/imgupload"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(byteStream.toByteArray()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                logger.info("Bild {} erfolgreich zu Display (mac: {}, dither=1) hochgeladen", filename, mac);
            } else {
                logger.error("Fehler beim Hochladen: HTTP {} - {}", response.statusCode(), response.body());
            }

        } catch (Exception e) {
            logger.error("Fehler beim Hochladen des Bildes zu OEPL: {}", e.getMessage(), e);
        }
    }



    //possibility to upload images to the /edit endpoint of OEPL
    public void uploadImageToOEPL(String filename) {
        try {
            logger.debug("wir gehen rein1");
            File imageFile = new File(UPLOADS_DIR + File.separator + filename);
            if (!imageFile.exists()) {
                logger.debug("Datei existiert nicht: {}", imageFile.getAbsolutePath());
                return;
            }

            HttpClient client = HttpClient.newHttpClient();
            String boundary = "----Boundary" + System.currentTimeMillis();
            String CRLF = "\r\n";

            var byteStream = new java.io.ByteArrayOutputStream();
            var writer = new java.io.OutputStreamWriter(byteStream, java.nio.charset.StandardCharsets.UTF_8);

            // Datei
            writer.append("--").append(boundary).append(CRLF);
            writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"")
                    .append(filename).append("\"").append(CRLF);
            writer.append("Content-Type: image/jpeg").append(CRLF).append(CRLF);
            writer.flush();

            java.nio.file.Files.copy(imageFile.toPath(), byteStream);
            byteStream.write(CRLF.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            writer.append("--").append(boundary).append("--").append(CRLF);
            writer.close();

            HttpRequest uploadRequest = HttpRequest.newBuilder()
                    .uri(new URI("http://" + OEPL_HOST + "/edit")) // nur Datei hochladen
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(byteStream.toByteArray()))
                    .build();

            HttpResponse<String> uploadResponse = client.send(uploadRequest, HttpResponse.BodyHandlers.ofString());
            if (uploadResponse.statusCode() == 200) {
                logger.debug("Bild {} erfolgreich in OEPL static-Ordner hochgeladen", filename);
            } else {
                logger.debug("Fehler beim Hochladen in static-Ordner: HTTP {} - {}", uploadResponse.statusCode(), uploadResponse.body());
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // Thread-Status wiederherstellen
            logger.debug("wir wurden mal wieder unterbrochen");
        } catch (Exception e) {
            logger.error("Fehler beim Hochladen des Bildes in OEPL static-Ordner");
        }
    }

    // possibility to send JSON Templates to OEPL (currently not in use)
    public void sendJSONToDisplay(String filename, String mac) {
        try {

            // sending jsonString (test string)
            String jsonString = """
                    [
                       {"rbox":[15,11,68,28,10,0,1,1]},
                       {"text":[290,17,"","fonts/bahnschrift20",1]},
                       {"text":[24,100,"{.Name1}","fonts/bahnschrift20",1]},
                       {"rbox":[98,11,68,28,10,2,2,1]},
                       {"text":[100,11,"nicht stören","fonts/calibrib_30.ttf",0,0,11]},
                       {"text":[265,0,"{.Raumnummer}","fonts/calibrib_30.ttf",1]},
                       {"text":[24,11,"verfügbar","fonts/calibrib_30.ttf",1,0,11]},
                       {"line":[400,240,0,240,2]},
                       {"text":[15,249,"Angestellte der Hochschulbörse","fonts/calibrib_30.ttf",1,0,15]},
                       {"text":[24,180,"{.Name3}","fonts/bahnschrift20",1]},
                       {"text":[24,140,"{.Name2}","fonts/bahnschrift20",1]}
                     ]
            """;

            // URL-encoden
            String encodedJson = URLEncoder.encode(jsonString, StandardCharsets.UTF_8);
            String formData = String.format("mac=%s&json=%s", mac, encodedJson);

            // HTTP-Client build
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("http://" + OEPL_HOST + "/jsonupload"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formData))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                logger.info("Image successfully sent to: {} (mac: {})", filename, mac);
            } else {
                logger.error("Error while sending image: HTTP {} - {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            logger.error("Error while sending image to OEPL: {}", e.getMessage(), e);
        }
    }
}
