package master.it_projekt_tablohm.controller;

import jakarta.annotation.PostConstruct;
import master.it_projekt_tablohm.models.Image;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import master.it_projekt_tablohm.repositories.EventRepository;
import master.it_projekt_tablohm.repositories.ImageRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping(path = "/image")
@CrossOrigin(origins = "*")
public class ImageController {

    private final ImageRepository imageRepository;
    private final EventRepository eventRepository;
    private final DisplayRepository displayRepository;

    public ImageController(ImageRepository imageRepository, EventRepository eventRepository, DisplayRepository displayRepository) {
        this.imageRepository = imageRepository;
        this.eventRepository = eventRepository;
        this.displayRepository = displayRepository;
    }

    // Define the uploads directory (adjust as needed)
    private final String uploadsDirPath = System.getProperty("user.dir") + File.separator +
            "src" + File.separator + "frontend" + File.separator +
            "public" + File.separator + "uploads";

    // Ensure the uploads directory exists
    private boolean ensureUploadsDirectoryExists() {
        File uploadsDir = new File(uploadsDirPath);
        if (!uploadsDir.exists()) {
            return uploadsDir.mkdir();
        }
        return true;
    }

    @PostConstruct
    public void synchronizeImages() {
        // Ensure the uploads directory exists
        if (!ensureUploadsDirectoryExists()) {
            System.err.println("Uploads directory could not be created.");
            return;
        }

        // Get the uploads folder as a File object
        File uploadsDir = new File(uploadsDirPath);
        // List file names present in the uploads folder
        Set<String> fileNamesInFolder = Arrays.stream(uploadsDir.listFiles())
                .filter(File::isFile)
                .map(File::getName)
                .collect(Collectors.toSet());

        // Retrieve all image records from the database
        List<Image> imagesFromDb = imageRepository.findAll();
        // Extract the file names stored in the database
        Set<String> fileNamesInDb = imagesFromDb.stream()
                .map(Image::getFilename)
                .collect(Collectors.toSet());

        // Add missing files to the database
        for (String fileName : fileNamesInFolder) {
            if (!fileNamesInDb.contains(fileName)) {
                Image newImage = new Image();
                newImage.setFilename(fileName);
                newImage.setUploadDate(LocalDateTime.now());
                imageRepository.save(newImage);
                System.out.println("Added missing image record for file: " + fileName);
            }
        }

        // Remove records from the database for files that no longer exist in the folder
        for (Image image : imagesFromDb) {
            if (!fileNamesInFolder.contains(image.getFilename())) {
                imageRepository.delete(image);
                System.out.println("Removed image record for missing file: " + image.getFilename());
            }
        }
    }


    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public @ResponseBody String uploadImage(@RequestParam("image") MultipartFile image) {
        // Define the uploads directory outside the src folder

        String uploadsDirPath = System.getProperty("user.dir") + File.separator +
                "src" + File.separator + "frontend" + File.separator +
                "public" + File.separator + "uploads";
        File uploadsDir = new File(uploadsDirPath);

        // Create the directory if it does not exist
        if (!uploadsDir.exists()) {
            if (!uploadsDir.mkdir()) {
                return "Failed to create uploads directory.";
            }
        }

        // Save the uploaded file
        try {
            String filePath = uploadsDirPath + File.separator + image.getOriginalFilename();
            File destinationFile = new File(filePath);
            image.transferTo(destinationFile);
            Image newImage = new Image();
            newImage.setFilename(image.getOriginalFilename());
            newImage.setUploadDate(LocalDateTime.now());
            imageRepository.save(newImage);
            return "Image uploaded successfully to: " + filePath;
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to upload image: " + e.getMessage();
        }
    }


    @CrossOrigin(origins = "*")
    @GetMapping(path = "/download/{filename}")
    public @ResponseBody ResponseEntity<byte[]> downloadImage(@PathVariable("filename") String filename) {
        // Create path to upload folder
        // Define the uploads directory outside the src folder
        String uploadsDirPath = System.getProperty("user.dir") + File.separator +
                "src" + File.separator + "frontend" + File.separator +
                "public" + File.separator + "uploads";
        File file = new File(uploadsDirPath, filename);

        if (!file.exists()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try (InputStream inputStream = new FileInputStream(file)) {
            byte[] fileContent = inputStream.readAllBytes();
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, "image/jpeg");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @GetMapping(path = "/listByDate")
    public @ResponseBody ResponseEntity<List<Image>> listImages() {
        List<Image> images = imageRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadDate"));
        return ResponseEntity.ok(images);
    }

    @GetMapping(path = "/listByFilename")
    public @ResponseBody ResponseEntity<List<Image>> listImagesByFilename() {
        List<Image> images = imageRepository.findAll(Sort.by(Sort.Direction.ASC, "filename"));
        return ResponseEntity.ok(images);
    }

    @CrossOrigin("*")
    @DeleteMapping(path = "/delete/{filename}")
    public @ResponseBody ResponseEntity<String> deleteImage(@PathVariable("filename") String filename) {
        File file = new File(uploadsDirPath, filename);

        if (!file.exists()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("The image you are trying to delete doesn't exist.");
        }

        // Check if image is used by any event
        if (eventRepository.existsByDisplayImages_Image(filename)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot delete image: It is used by an event.");
        }

        // Check if image is used as a default image by any display
        if (displayRepository.existsByDefaultFilename(filename)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot delete image: It is set as a default image by a display.");
        }

        // Delete the image record from the database
        Image imageToDelete = imageRepository.findByFilename(filename);
        if (imageToDelete != null) {
            imageRepository.delete(imageToDelete);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Image record not found in database.");
        }

        // Delete the file from the file system
        if (!file.delete()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete image file.");
        }
        return ResponseEntity.ok("Image deleted successfully.");
    }


    @CrossOrigin(origins = "*")
    @GetMapping(path = "/exists")
    public @ResponseBody ResponseEntity<Map<String, Boolean>> checkImageExists(@RequestParam("filename") String filename) {
        String uploadsDirPath = System.getProperty("user.dir") + File.separator +
                "src" + File.separator + "frontend" + File.separator +
                "public" + File.separator + "uploads";
        File file = new File(uploadsDirPath, filename);
        boolean exists = file.exists();
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }


}
