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

macAddress=00:1B:44:11:3A:B7&brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename=moon.jpg
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
  "filename": "src/frontend/public/uploads/moon.jpg",
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

Here is the documentation for the `EventController` endpoints added to your README file:

---

#### **9. Switch Display**
**POST** `/switch`

##### Description:
Updates the `lastSwitch` timestamp and the associated `filename` of an existing display in the database based on its MAC address.

##### Request Parameters:
- **macAddress** (String, required): The MAC address of the display to be switched.
- **filename** (String, required): The new filename to associate with the display.

##### Request Example:
```http
POST /switch
Content-Type: application/x-www-form-urlencoded

macAddress=00:1B:44:11:3A:B7&filename=new_image.jpg
```

##### Response:
- **200 OK**: The display's `lastSwitch` timestamp and `filename` were updated successfully.
    - **Response Body**: A message confirming the update.
        - Example:  
          `"Image of Display with MAC address: 00:1B:44:11:3A:B7 switched to new_image.jpg at 2025-01-28T10:45:00."`

- **404 NOT FOUND**: If no display is found with the provided MAC address.
    - **Response Body**: A message indicating that the display was not found.
        - Example:  
          `"Display with MAC address 00:1B:44:11:3A:B7 not found."`

##### Notes:
- The `filename` parameter allows switching the display to a new image by updating the associated filename in the database.
- The `lastSwitch` timestamp will be updated to the current server time.
- This endpoint only updates existing displays; it does not create new ones.

--- 

#### **10. Get Distinct Display Brands**
**GET** `/display/brands`

##### Description:
Retrieves a list of all unique display brands stored in the database. If multiple displays share the same brand, the brand is only returned once.

##### Request Parameters:
- **None**

##### Request Example:
```http
GET /display/brands
```

##### Response:
- **200 OK**: The request was successful, and a list of unique brands is returned.
- **Response Body**: A JSON array of distinct brands.
    - Example:
      ```json
      [
        "Phillips",
        "Samsung",
        "LG"
      ]
      ```

##### Notes:
- The endpoint filters out duplicate brands to return only unique values.
- If no displays are present in the database, an empty list (`[]`) will be returned.

--- 

#### **11. Update Display Battery Percentage**
**POST** `/postBattery`

##### **Description:**
Updates the battery percentage of a display identified by its MAC address. If the display exists, the battery percentage and timestamp are updated; otherwise, a message indicating that the display was not found is returned.

##### **Request Parameters:**
- **macAddress** (String, required) – The MAC address of the display.
- **batteryPercentage** (Integer, required) – The battery percentage to update.

##### **Request Example:**
```http
POST /postBattery?macAddress=00:1A:2B:3C:4D:5E&batteryPercentage=85
```  

##### **Response:**
- **200 OK**: The request was successful.
- **Response Body**: A string message indicating whether the update was successful or if the display was not found.

    - **Example (Successful Update):**
      ```json
      "Battery percentage of Display with MAC address: 00:1A:2B:3C:4D:5E saved at 2025-02-06T12:34:56.789."
      ```  

    - **Example (Display Not Found):**
      ```json
      "Display with MAC address 00:1A:2B:3C:4D:5E not found."
      ```  

##### **Notes:**
- The request updates both the battery percentage and the timestamp when the update was made.
- If the MAC address does not match any existing display, no changes are made, and an error message is returned.

---

## **API Documentation: EventController**

### **1. Add an Event**
**POST** `/event/add`

#### **Description:**
Adds a new event associated with multiple displays.

#### **Request Body:**
```json
{
  "title": "Meeting",
  "allDay": false,
  "start": "2024-12-12T08:00:00",
  "end": "2024-12-12T09:00:00",
  "displayImages": [
    { "displayMac": "00:00:00:00:04", "image": "screen1.jpg" },
    { "displayMac": "00:00:00:00:05", "image": "screen2.jpg" }
  ]
}
```
#### **Responses:**
- **200 OK**: Event saved successfully.
- **400 Bad Request**: If displays don't exist or an event overlaps with another event.

---

### **2. Get Events by Display**
**GET** `/event/all/{displayMac}`

#### **Description:**
Retrieves all events associated with a specific display.

#### **Response Example:**
```json
[
  {
    "id": 1,
    "title": "Meeting",
    "allDay": false,
    "start": "2024-12-12T08:00:00",
    "end": "2024-12-12T09:00:00",
    "displayImages": [
      { "displayMac": "00:00:00:00:04", "image": "screen1.jpg" }
    ]
  }
]
```

---

### **3. Update an Event**
**PUT** `/event/update/{id}`

#### **Description:**
Updates an event, including display images.

#### **Request Example:**
```json
{
  "title": "Updated Meeting",
  "allDay": false,
  "start": "2024-12-12T10:30:00",
  "end": "2024-12-12T11:30:00",
  "displayImages": [
    { "displayMac": "00:00:00:00:04", "image": "updated_screen1.jpg" },
    { "displayMac": "00:00:00:00:05", "image": "updated_screen2.jpg" }
  ]
}
```
#### **Responses:**
- **200 OK**: Event updated successfully.
- **404 Not Found**: If event ID is not found.

---

### **4. Delete an Event**
**DELETE** `/event/delete/{id}`

#### **Description:**
Deletes an event by its ID.

#### **Response:**
- **200 OK**: Event deleted.
- **404 Not Found**: If the event does not exist.

---

### **5. Get All Events**
**GET** `/event/all`

#### **Response Example:**
```json
[
  {
    "id": 1,
    "title": "Meeting",
    "allDay": false,
    "start": "2024-12-12T08:00:00",
    "end": "2024-12-12T09:00:00",
    "displayImages": [
      { "displayMac": "00:00:00:00:04", "image": "screen1.jpg" }
    ]
  }
]
```

---

## **ConfigController - README**

#### **Overview**
The `ConfigController` handles configuration settings for the application. It ensures that only **one configuration object exists** at any time. The controller provides endpoints to **retrieve** and **update** configuration settings.

---

### **Endpoints**

#### **1. Retrieve Configuration**
**GET** `/config/get`
- Returns the existing configuration.
- If no configuration exists, returns **404 Not Found**.

**Example Request:**
```http
GET http://localhost:8080/config/get
```

**Example Response (200 OK):**
```json
{
  "wakeIntervalDay": 30,
  "wakeIntervalNight": 60,
  "leadTime": 10,
  "followUpTime": 5,
  "deleteAfterDays": 30
}
```

**Example Response (404 Not Found):**
```json
{
  "error": "Not Found"
}
```

---

#### **2. Create or Update Configuration**
**POST** `/config/post`
- If no configuration exists, creates a new one.
- If a configuration exists, updates the existing one.

**Example Request:**
```http
POST http://localhost:8080/config/post
Content-Type: application/json

{
  "wakeIntervalDay": 45,
  "wakeIntervalNight": 90,
  "leadTime": 15,
  "followUpTime": 10,
  "deleteAfterDays": 30
}
```

**Example Response (200 OK - Created/Updated):**
```json
{
  "wakeIntervalDay": 45,
  "wakeIntervalNight": 90,
  "leadTime": 15,
  "followUpTime": 10,
  "deleteAfterDays": 30
}
```

---

## Recurring Event Scheduling with RRULE

### Request Format
To schedule a recurring event, send a `POST` request to:

```
POST http://localhost:8080/recevent/add
Content-Type: application/json
```

**Example Request:**
```json
{
  "start": "2025-12-12T08:00:00",
  "end": "2025-12-12T09:00:00",
  "rrule": "FREQ=WEEKLY;BYDAY=MO;COUNT=4",
  "displayImages": [
    {
      "displayMac": "00:00:00:00:04",
      "image": "screen1.jpg"
    },
    {
      "displayMac": "00:00:00:00:05",
      "image": "screen2.jpg"
    }
  ]
}
```

### How RRULE Works
- **`start` & `end`**: Define the base date and time for the event.
- **`rrule`**: Defines the recurrence pattern.
    - `FREQ=WEEKLY` → Repeats every week.
    - `BYDAY=MO` → Occurs only on Mondays.
    - `COUNT=4` → Repeats 4 times.

### Important Behavior
- The **RRULE determines the first valid occurrence**, regardless of the `start` date.
- If `start` is set to a different day than `BYDAY`, the event will **shift to the next valid recurrence day**.
    - Example: If `start` is a Thursday but `BYDAY=MO`, the first event will occur on the **next Monday**.
- If no `BYDAY` is provided, the event repeats based on the exact `start` date.

### Examples
| `start` Date | `rrule` | First Occurrence | Recurrence Pattern |
|-------------|--------|-----------------|--------------------|
| `"2025-03-06T08:00:00"` (Thu) | `FREQ=WEEKLY;BYDAY=MO;COUNT=4` | Mon, March 10 | Every Monday for 4 weeks |
| `"2025-03-03T08:00:00"` (Mon) | `FREQ=WEEKLY;BYDAY=MO;COUNT=4` | Mon, March 3 | Every Monday for 4 weeks |
| `"2025-03-06T08:00:00"` (Thu) | `FREQ=WEEKLY;COUNT=4` | Thu, March 6 | Every Thursday for 4 weeks |

For more details on RRULE formatting, refer to [RFC 5545](https://tools.ietf.org/html/rfc5545#section-3.8.5.3).

---


