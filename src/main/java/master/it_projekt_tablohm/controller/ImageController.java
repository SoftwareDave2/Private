package master.it_projekt_tablohm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Controller
@RequestMapping(path = "/image")
public class ImageController {

    @PostMapping(path = "/upload")
    public @ResponseBody String uploadImage(@RequestParam("image") MultipartFile image) {
        // Define the uploads directory outside the src folder
        String uploadsDirPath = System.getProperty("user.dir") + File.separator + "uploads";
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
}
