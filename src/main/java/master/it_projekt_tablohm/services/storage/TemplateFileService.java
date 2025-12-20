package master.it_projekt_tablohm.services.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@Service
public class TemplateFileService {

    private static final Logger logger = LoggerFactory.getLogger(TemplateFileService.class);

    private final Path templateDirectory;
    private final String seedLocation;
    private final ResourceLoader resourceLoader;

    public TemplateFileService(@Value("${oepl.templates.directory:templates}") String templateDirectory,
                               @Value("${oepl.templates.seed-location:classpath:/templates/seed}") String seedLocation,
                               ResourceLoader resourceLoader) {
        this.templateDirectory = Paths.get(templateDirectory);
        this.seedLocation = seedLocation.endsWith("/") ? seedLocation.substring(0, seedLocation.length() - 1) : seedLocation;
        this.resourceLoader = resourceLoader;
        ensureDirectoryExists();
    }

    public String loadTemplate(String templateType, int width, int height) {
        Path path = resolvePath(templateType, width, height);
        ensureTemplatePresent(templateType, width, height, path);
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read template file " + path, e);
        }
    }

    public Path saveTemplate(String templateType, int width, int height, String svgContent) {
        Path path = resolvePath(templateType, width, height);
        try {
            Files.createDirectories(path.getParent());
            Files.writeString(path, svgContent, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            logger.info("Saved template '{}' ({}x{}) to {}", templateType, width, height, path.toAbsolutePath());
            return path;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store template '" + templateType + "' at " + path, e);
        }
    }

    public Path resolvePath(String templateType, int width, int height) {
        String fileName = sanitized(templateType) + "_" + width + "x" + height + ".svg";
        return templateDirectory.resolve(fileName);
    }

    private String sanitized(String templateType) {
        return templateType.replaceAll("[^a-zA-Z0-9_-]", "_");
    }

    private void ensureDirectoryExists() {
        try {
            Files.createDirectories(templateDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create template directory at " + templateDirectory, e);
        }
    }

    private void ensureTemplatePresent(String templateType, int width, int height, Path targetPath) {
        if (Files.exists(targetPath)) {
            return;
        }
        String fileName = targetPath.getFileName().toString();
        String seedResourcePath = seedLocation + "/" + fileName;
        Resource seedResource = resourceLoader.getResource(seedResourcePath);
        if (!seedResource.exists()) {
            throw new IllegalStateException("Missing template seed for '" + templateType + "' (" + width + "x" + height + ") at " + seedResourcePath);
        }
        try (InputStream in = seedResource.getInputStream()) {
            Files.createDirectories(targetPath.getParent());
            Files.copy(in, targetPath);
            logger.info("Initialized template '{}' ({}x{}) from {}", templateType, width, height, seedResourcePath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to copy seed template from " + seedResourcePath + " to " + targetPath, e);
        }
    }
}
