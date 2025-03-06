package master.it_projekt_tablohm.models;

import jakarta.persistence.Embeddable;

import java.util.Objects;

@Embeddable
public class DisplayError {
    private Integer errorCode;
    private String errorMessage;

    public DisplayError() {}

    public DisplayError(Integer errorCode, String errorMessage) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public Integer getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(Integer errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DisplayError that = (DisplayError) o;
        return Objects.equals(errorCode, that.errorCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(errorCode);
    }
}

