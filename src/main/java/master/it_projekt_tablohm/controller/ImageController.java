package master.it_projekt_tablohm.controller;

import master.it_projekt_tablohm.models.Image;
import master.it_projekt_tablohm.repositories.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@Controller
@RequestMapping(path = "/image")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private ImageRepository imageRepository;

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

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public @ResponseBody ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile image) {
        if (!ensureUploadsDirectoryExists()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create uploads directory.");
        }

        String originalFilename = image.getOriginalFilename();
        // Extract file extension if present
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }
        // Generate a unique internal name
        String internalName = UUID.randomUUID().toString() + extension;
        String filePath = uploadsDirPath + File.separator + internalName;
        File destinationFile = new File(filePath);

        try {
            image.transferTo(destinationFile);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }

        // Create and save the image record
        Image img = new Image();
        img.setInternalName(internalName);
        img.setFilename(originalFilename);
        img.setUploadDate(LocalDateTime.now());
        imageRepository.save(img);

        return ResponseEntity.ok("Image uploaded successfully with id: " + img.getId());
    }

    @GetMapping(path = "/download/{internalName}")
    public @ResponseBody ResponseEntity<byte[]> downloadImage(@PathVariable("internalName") String internalName) {
        File file;
        String displayFilename;

        // Check if the requested filename is "initial.jpg"
        if ("initial.jpg".equalsIgnoreCase(internalName)) {
            // Directly use "initial.jpg" from the uploads folder
            file = new File(uploadsDirPath, "initial.jpg");
            displayFilename = "initial.jpg";
        } else {
            // Otherwise, look up the image in the repository
            Optional<Image> optionalImage = imageRepository.findByInternalName(internalName);
            if (!optionalImage.isPresent()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            Image img = optionalImage.get();
            file = new File(uploadsDirPath, img.getInternalName());
            displayFilename = img.getFilename();
        }

        if (!file.exists()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        try (InputStream inputStream = new FileInputStream(file)) {
            byte[] fileContent = inputStream.readAllBytes();
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + displayFilename + "\"");
            // You can change the content type if needed.
            headers.add(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE);
            return ResponseEntity.ok().headers(headers).body(fileContent);
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

    @DeleteMapping(path = "/delete/{id}")
    public @ResponseBody ResponseEntity<String> deleteImage(@PathVariable("id") int id) {
        Optional<Image> optionalImage = imageRepository.findById(id);
        if (!optionalImage.isPresent()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("The image you are trying to delete doesn't exist.");
        }
        Image img = optionalImage.get();
        File file = new File(uploadsDirPath, img.getInternalName());
        if (file.exists()){
            file.delete();
        }
        imageRepository.delete(img);
        return ResponseEntity.ok("Image deleted successfully.");
    }

    @PutMapping(path = "/rename/{id}")
    public @ResponseBody ResponseEntity<String> renameImage(@PathVariable("id") int id,
                                                            @RequestBody Map<String, String> request) {
        Optional<Image> optionalImage = imageRepository.findById(id);
        if (!optionalImage.isPresent()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Image not found.");
        }
        Image img = optionalImage.get();
        String newFilename = request.get("filename");
        if (newFilename == null || newFilename.trim().isEmpty()){
            return ResponseEntity.badRequest().body("Invalid filename.");
        }
        img.setFilename(newFilename);
        imageRepository.save(img);
        return ResponseEntity.ok("Image renamed successfully.");
    }
}
