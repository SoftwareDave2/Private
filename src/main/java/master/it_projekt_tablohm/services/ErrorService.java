package master.it_projekt_tablohm.services;

import jakarta.transaction.Transactional;
import master.it_projekt_tablohm.models.Display;
import master.it_projekt_tablohm.models.DisplayError;
import master.it_projekt_tablohm.repositories.DisplayRepository;
import org.springframework.stereotype.Service;
import java.util.Iterator;
import java.util.Optional;

@Service
public class ErrorService {
    private final DisplayRepository displayRepository;

    public ErrorService(DisplayRepository displayRepository) {
        this.displayRepository = displayRepository;
    }

    public void addErrorToDisplay(Integer displayId, Integer errorCode, String errorMessage) {
        Optional<Display> optionalDisplay = displayRepository.findById(displayId);
        if (optionalDisplay.isPresent()) {
            Display display = optionalDisplay.get();
            display.addError(errorCode, errorMessage);
            displayRepository.save(display);
        } else {
            throw new RuntimeException("Display not found with ID: " + displayId);
        }
    }

    public void removeErrorFromDisplay(Integer displayId, Integer errorCode) {
        Optional<Display> optionalDisplay = displayRepository.findById(displayId);
        if (optionalDisplay.isPresent()) {
            Display display = optionalDisplay.get();
            display.removeErrorByCode(errorCode);
            displayRepository.save(display);
        } else {
            throw new RuntimeException("Display not found with ID: " + displayId);
        }
    }
}

