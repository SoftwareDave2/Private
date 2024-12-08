# Webservice IT-Projekt

---

## **Requirements**

Before running the application, make sure you have the following installed:

### 1. **Node.js**
- You need Node.js installed because the frontend is built using Next.js.
- You can download and install it from [Node.js official website](https://nodejs.org/).

### 2. **Docker Desktop**
- Docker Desktop is required to run the database container.
- Download and install Docker Desktop from [Docker official website](https://www.docker.com/products/docker-desktop).

### 3. **Java 17**
- The backend is developed using Spring Boot and requires Java 17.
- Download and install Java 17 from [OpenJDK](https://adoptium.net/) or other providers of your choice.

### 4. **Maven (Build Tool)**
- We use Maven as the build tool for the backend project. Make sure you have it installed on your system.
- Download and install Maven from [Maven official website](https://maven.apache.org/).

---

## **How to Run the Application (Option 1: manually)**

### 1. **Start the Spring Boot Backend**
- Navigate to the root directory of the project in your terminal.
- Use Maven to build and run the backend:
  ```bash
  mvn clean install
  mvn spring-boot:run
  ```
- This will start the Spring Boot application with the backend API and necessary endpoints.

### 2. **Start the Next.js Frontend**
- Navigate to the frontend project directory in your terminal.
  ```bash
  src/frontend/
  ```
- Install the required Node.js dependencies:
  ```bash
  npm install
  ```
- After the dependencies are installed, start the Next.js development server:
  ```bash
  npm run dev
  ```
- This will start the frontend application on [http://localhost:3000](http://localhost:3000).

### 4. **Access the Application**
- Once both the frontend and backend are running, you can access the application by opening your web browser and navigating to [http://localhost:3000](http://localhost:3000).
- The backend will be available on the configured API endpoints (e.g., `/display/add`, `/display/delete/{id}`, etc.).

---

## **How to Run the Application (Option 2: start script)**

### Documentation for Start Script

#### Overview
This PowerShell script is designed to automate the startup of a web service environment, including starting Docker Desktop, cleaning and building the backend using Maven, and managing the frontend using npm. The script also monitors for a keypress (`q`) to stop all running processes and return to the root directory.

#### Features:
- **Checks if Docker Desktop is installed** and starts it if necessary.
- **Waits for Docker to be fully ready** before continuing.
- **Runs Maven clean** to clean the backend project.
- **Starts the backend server** using Spring Boot.
- **Installs npm dependencies** for the frontend and starts the frontend server.
- Monitors for the `q` keypress to clean up and exit.

---

#### How to Use:
1. **Prerequisites**:
  - Docker Desktop must be installed on your system.
  - Maven and npm should be set up for the backend and frontend, respectively.

2. **Running the Script**:
  - Open PowerShell in your project directory (where the script is located).
  - Execute the script by running:
    ```powershell
    .\start_script.ps1
    ```
  - The script will:
    1. Check if Docker Desktop is installed and running.
    2. Start Docker Desktop if it's not running.
    3. Wait for Docker to be ready before proceeding.
    4. Run the `mvnw clean` command to clean the backend.
    5. Start the backend server using Spring Boot (`spring-boot:run`).
    6. Navigate to the frontend directory, install npm dependencies, and start the frontend with `npm run dev`.

3. **Stopping Processes**:
  - The script will continuously run the backend and frontend processes.
  - To stop all processes and return to the root directory:
    1. Press the `q` key while the script is running.
    2. The script will stop all processes (Maven, npm, node) and return to the root directory.

---

#### Example Usage:

1. **Start the script**:
   ```powershell
   .\start_script.ps1
   ```

2. **Stopping processes**:
  - While the script is running, press `q` to stop all processes and return to the root directory.

---

### **API Documentation: DisplayController**

This API allows you to interact with the `Display` resource, enabling operations such as adding, deleting, and retrieving displays.

---

#### **1. Add a Display**
**POST** `/display/add`

##### Description:
Adds a new display to the database.

##### Request Parameters:
- **macAddress** (String, required): The MAC address of the display.
- **brand** (String, required): The brand of the display.
- **model** (String, required): The model name of the display.
- **width** (Integer, required): The width of the display in pixels.
- **height** (Integer, required): The height of the display in pixels.
- **orientation** (String, required): The orientation of the display (e.g., "vertical", "horizontal").
- **filename** (String, optional): The filename associated with the display’s image.
- **wakeTime** (LocalDateTime, optional): The wake time of the display. If not provided, it will not be set.

##### Request Example:
```http
POST /display/add
Content-Type: application/x-www-form-urlencoded

macAddress=00:1B:44:11:3A:B7&brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename=moon.png
```

##### Response:
- **200 OK**: Display is successfully added.
- **Response Body**: `"Saved"`

##### Notes:
- If the display is successfully added, the system will return a simple "Saved" message.
- If the display with the given MAC address has not been initiated, the system will return an error message.

---

#### **2. Delete a Display**
**DELETE** `/display/delete/{mac}`

##### Description:
Deletes a display from the database by its MAC address.

##### Path Parameter:
- **mac** (String, required): The MAC address of the display to delete.

##### Request Example:
```http
DELETE /display/delete/00:1B:44:11:3A:B7
```

##### Response:
- **200 OK**: Display with the specified MAC address is successfully deleted.
- **Response Body**: `"Display with MAC address 00:1B:44:11:3A:B7 deleted."`

- **404 Not Found**: If the display with the specified MAC address does not exist.
- **Response Body**: `"Display with MAC address 00:1B:44:11:3A:B7 not found."`

##### Notes:
- The display is deleted only if it exists in the database. If the MAC address is not found, the system will return a "not found" message.

---

#### **3. Get All Displays**
**GET** `/display/all`

##### Description:
Retrieves all displays from the database.

##### Response:
- **200 OK**: A list of all displays in the database.

- **Response Body** (Example):
```json
[
  {
    "id": "Integer",
    "macAddress": "String",
    "brand": "String",
    "model": "String",
    "width": "Integer",
    "height": "Integer",
    "orientation": "String",
    "filename": "String or null",
    "wakeTime": "String or null"
  }
]
```

##### Notes:
- This endpoint returns a JSON array of all display records in the database.

---

#### **4. Initiate a Display**
**POST** `/display/initiate`

##### Description:
Initiates a display by associating it with a MAC address, width, and height. If a display with the given MAC address already exists, a message is returned indicating that the display is already initiated. If required parameters are missing, an error message is returned.

##### Request Parameters:
- **macAddress** (String, required): The MAC address of the display.
- **width** (Integer, required): The width of the display in pixels.
- **height** (Integer, required): The height of the display in pixels.

##### Request Example:
```http
POST /display/initiate
Content-Type: application/x-www-form-urlencoded

macAddress=00:1B:44:11:3A:B7&width=1920&height=1080
```

##### Response:
- **200 OK**:
    - If the display is successfully initiated (new display created): `"Display initiated with mac-address: 00:1B:44:11:3A:B7"`
    - If the display with the provided MAC address already exists: `"Display with mac-address: 00:1B:44:11:3A:B7 is already initiated."`
    - The response includes the `currentTime` (current system time) and the `wakeTime` (the calculated wake time for the display).

- **400 Bad Request**: If required parameters are missing: `"Error: Required parameters (macAddress, width, height) are missing."`

##### Response Body (Example):
```json
{
  "currentTime": "2024-12-01T12:30:00",
  "wakeTime": "2024-12-01T13:30:00",
  "message": "Display initiated with mac-address: 00:1B:44:11:3A:B7"
}
```

##### Notes:
- This endpoint checks if a display with the provided MAC address already exists in the database. If it does, it returns a message indicating that the display has already been initiated.
- If the MAC address is new, the display is created and saved in the database with the provided width and height, and a wake time set to one hour from the current time.
- If any of the required parameters are missing, the system returns an error message indicating the missing parameters.

---

#### **5. Upload an Image**
**POST** `/image/upload`

##### Description:
Uploads an image file to the server.

##### Request Parameters:
- **image** (Multipart File, required): The image file to upload.

##### Request Example:
```http
POST /image/upload
Content-Type: multipart/form-data

(image file attached)
```

##### Response:
- **200 OK**: Image is successfully uploaded.
- **Response Body**: `"Image uploaded successfully to: <file-path>"`

- **400 Bad Request**: If the file is not provided or an error occurs during the upload.
- **Response Body**: `"Failed to upload image: <error-message>"`

##### Notes:
- The uploaded images are stored in the `uploads` folder located at `src/frontend/public/uploads`.

---

#### **6. Download an Image**
**GET** `/image/download/{filename}`

##### Description:
Downloads an image file from the server by its filename.

##### Path Parameter:
- **filename** (String, required): The name of the image file to download, including the file extension (e.g., `moon.jpg`).

##### Request Example:
```http
GET /image/download/moon.jpg
```

##### Response:
- **200 OK**: The image file is successfully retrieved and returned as a downloadable resource.
- **Response Headers**:
  - `Content-Disposition`: `attachment; filename="moon.jpg"`
  - `Content-Type`: The MIME type of the image (e.g., `image/jpeg`).

- **404 Not Found**: If the image file with the specified name does not exist.
- **Response Body**: `null`

- **500 Internal Server Error**: If an unexpected error occurs while retrieving the file.
- **Response Body**: `null`

##### Notes:
- Ensure the requested filename exists in the `uploads` directory. If the file does not exist, the server will return a 404 error.
- Example files like `moon.jpg` are provided in the `uploads` directory for testing.

---

### Error Responses:

- **400 Bad Request**: If any required parameter is missing or invalid in the request body (for POST requests).
- **404 Not Found**: If the requested resource (e.g., display by ID) is not found.
- **500 Internal Server Error**: For unexpected errors during server processing.

---

#### **7. Get a Display by MAC Address**
**GET** `/display/get/{mac}`

##### Description:
Retrieves a display from the database by its MAC address.

##### Path Parameter:
- **mac** (String, required): The MAC address of the display to retrieve.

##### Request Example:
```http
GET /display/get/00:1B:44:11:3A:B7
```

##### Response:
- **200 OK**: The display with the specified MAC address is successfully retrieved.
- **Response Body** (Example):
```json
{
  "id": 1,
  "macAddress": "00:1B:44:11:3A:B7",
  "brand": "Phillips",
  "model": "Tableux",
  "width": 1920,
  "height": 1080,
  "orientation": "vertical",
  "filename": "moon.png",
  "wakeTime": "2024-12-01T13:30:00"
}
```

- **404 Not Found**: If the display with the specified MAC address does not exist.
- **Response Body**: `"Display with MAC address 00:1B:44:11:3A:B7 not found."`

##### Notes:
- The display is retrieved only if it exists in the database. If the MAC address is not found, the system will return a "not found" message.

---

#### **8. Delete an Image**
**DELETE** `/delete/{filename}`

##### Description:
Deletes an image file from the server by its filename.

##### Path Parameter:
- **filename** (String, required): The name of the image file to delete, including the file extension (e.g., `moon.jpg`).

##### Request Example:
```http
DELETE /delete/moon.jpg
```

##### Response:
- **200 OK**: The image file is successfully deleted.
- **Response Body**: `"Image deleted successfully."`

- **404 Not Found**: If the image file with the specified name does not exist.
- **Response Body**: `"The image you are trying to delete doesn't exist."`

##### Notes:
- This endpoint removes the specified image file from the `uploads` directory located at `src/frontend/public/uploads`.
- Ensure that the filename exists and is correctly specified in the request. If the file does not exist, the server will respond with a message indicating that the file was not found.
- This operation does not return the deleted file or any other data beyond the success or failure message.

