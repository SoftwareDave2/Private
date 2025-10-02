package master.it_projekt_tablohm.helper;

import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.TranscoderOutput;

import javax.imageio.*;
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.metadata.IIOMetadataNode;
import javax.imageio.plugins.jpeg.JPEGImageWriteParam;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Iterator;

public class SVGToJPEGConverter {

    private static final Color[] PALETTE = {
            new Color(0, 0, 0),       // Black
            new Color(255, 255, 255), // White
            new Color(255, 0, 0)      // Red
    };

    public static void convertSVGToJPEG(String svgCode, String jpgPath)
            throws TranscoderException, IOException {

        // Step 1: Convert SVG to BufferedImage
        BufferedImage image = svgToBufferedImage(svgCode);

        // Step 2: Apply 3-color palette
        BufferedImage palettizedImage = applyPalette(image, PALETTE);

        // Step 3: Save as JPEG with baseline and 4:4:4 subsampling
        saveAsJPEG(palettizedImage, jpgPath);

        System.out.println("Conversion complete: " + jpgPath);
    }

    private static BufferedImage svgToBufferedImage(String svgCode)
            throws TranscoderException, IOException {

        // Create a PNG transcoder to get BufferedImage
        BufferedImageTranscoder transcoder = new BufferedImageTranscoder();

        // Create transcoder input from SVG string
        TranscoderInput input = new TranscoderInput(
                new StringReader(svgCode)
        );

        // Transcode
        transcoder.transcode(input, null);

        return transcoder.getBufferedImage();
    }

    private static BufferedImage applyPalette(BufferedImage source, Color[] palette) {
        int width = source.getWidth();
        int height = source.getHeight();

        BufferedImage result = new BufferedImage(
                width, height, BufferedImage.TYPE_INT_RGB
        );

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int rgb = source.getRGB(x, y);
                Color originalColor = new Color(rgb);
                Color closestColor = findClosestColor(originalColor, palette);
                result.setRGB(x, y, closestColor.getRGB());
            }
        }

        return result;
    }

    private static Color findClosestColor(Color color, Color[] palette) {
        Color closest = palette[0];
        double minDistance = colorDistance(color, palette[0]);

        for (int i = 1; i < palette.length; i++) {
            double distance = colorDistance(color, palette[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closest = palette[i];
            }
        }

        return closest;
    }

    private static double colorDistance(Color c1, Color c2) {
        int dr = c1.getRed() - c2.getRed();
        int dg = c1.getGreen() - c2.getGreen();
        int db = c1.getBlue() - c2.getBlue();
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    private static void saveAsJPEG(BufferedImage image, String outputPath) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) {
            throw new IllegalStateException("No JPEG writers found");
        }
        ImageWriter writer = writers.next();

        try (ImageOutputStream ios = ImageIO.createImageOutputStream(new File(outputPath))) {
            writer.setOutput(ios);

            JPEGImageWriteParam jpegParams = new JPEGImageWriteParam(null);
            jpegParams.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            jpegParams.setCompressionQuality(1.0f); // 100% Qualität
            jpegParams.setProgressiveMode(ImageWriteParam.MODE_DISABLED);

            // Schreibe Bild (Metadaten NICHT anfassen!)
            writer.write(null, new IIOImage(image, null, null), jpegParams);
        } finally {
            writer.dispose();
        }
    }


    // Custom transcoder to get BufferedImage
    static class BufferedImageTranscoder extends PNGTranscoder {
        private BufferedImage bufferedImage;

        @Override
        public BufferedImage createImage(int width, int height) {
            return new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        }

        @Override
        public void writeImage(BufferedImage img, TranscoderOutput output) {
            this.bufferedImage = img;
        }

        public BufferedImage getBufferedImage() {
            return bufferedImage;
        }
    }


    // EXAMPLE:
    //            String svgCode = """
    //                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    //                    <rect width="400" height="300" fill="white" />
    //                    <text x="50" y="200" font-size="30" fill="red">Hello OEPL!</text>
    //                    <circle cx="150" cy="100" r="50" fill="black" />
    //                </svg>
    //                """;
    //
    //            // 2. Speicherort für JPEG
    //            String testfile = "test_output.jpg";
    //            String outputPath = UPLOADS_DIR + File.separator + testfile;
    //
    //            // 3. SVG -> JPEG konvertieren
    //            SVGToJPEGConverter.convertSVGToJPEG(svgCode, outputPath);
}
