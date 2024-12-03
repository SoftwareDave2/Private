package master.it_projekt_tablohm.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping(path = "/image")
public class ImageController {

    @CrossOrigin(origins = "*")
    @PostMapping(path = "/upload")
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

    @CrossOrigin(origins = "*")
    @GetMapping(path = "/download/all")
    public @ResponseBody ResponseEntity<List<String>> listImages() {
        // Create path to upload folder
        String uploadsDirPath = System.getProperty("user.dir") + File.separator +
                "src" + File.separator + "frontend" + File.separator +
                "public" + File.separator + "uploads";
        File uploadsDir = new File(uploadsDirPath);

        if (!uploadsDir.exists() || !uploadsDir.isDirectory()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }

        // Collect all image filenames in the directory
        String[] imageFiles = uploadsDir.list((dir, name) -> {
            // Filter for common image file extensions
            String lowerCaseName = name.toLowerCase();
            return lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".jpeg") ||
                    lowerCaseName.endsWith(".png") || lowerCaseName.endsWith(".gif") ||
                    lowerCaseName.endsWith(".bmp") || lowerCaseName.endsWith(".webp");
        });

        if (imageFiles == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }

        return ResponseEntity.ok(Arrays.asList(imageFiles));
    }
}
