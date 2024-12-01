# Webservice IT-Projekt

## Project Infos
Java Version: 23
Build Gradle: Maven
Frontend Framework: next.js


## API Documentation: DisplayController

This API allows you to interact with the `Display` resource, enabling operations such as adding, deleting, and retrieving displays.

---

#### **1. Add a Display**
**POST** `/display/add`

##### Description:
Adds a new display to the database.

##### Request Parameters:
- **brand** (String, required): The brand of the display.
- **model** (String, required): The model name of the display.
- **width** (Integer, required): The width of the display in pixels.
- **height** (Integer, required): The height of the display in pixels.
- **orientation** (String, required): The orientation of the display (e.g., "vertical", "horizontal").
- **filename** (String, optional): The filename associated with the display’s image.

##### Request Example:
```http
POST /display/add
Content-Type: application/x-www-form-urlencoded

brand=Phillips&model=Tableux&width=1920&height=1080&orientation=vertical&filename=moon.png
```

##### Response:
- **200 OK**: Display is successfully added.
- **Response Body**: `"Saved"`

##### Notes:
- If the display is successfully added, the system will return a simple "Saved" message.

---

#### **2. Delete a Display**
**DELETE** `/display/delete/{id}`

##### Description:
Deletes a display from the database by its unique ID.

##### Path Parameter:
- **id** (Integer, required): The ID of the display to delete.

##### Request Example:
```http
DELETE /display/delete/52
```

##### Response:
- **200 OK**: Display with the specified ID is successfully deleted.
- **Response Body**: `"Display with ID 52 deleted."`

- **404 Not Found**: If the display with the specified ID does not exist.
- **Response Body**: `"Display with ID 52 not found."`

##### Notes:
- The display is deleted only if it exists in the database. If the ID is not found, the system will return a "not found" message.

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
    "brand": "String",
    "model": "String",
    "width": "Integer",
    "height": "Integer",
    "orientation": "String",
    "filename": "String or null"
  }
]
```

##### Notes:
- This endpoint returns a JSON array of all display records in the database.

---

### Error Responses:

- **400 Bad Request**: If any required parameter is missing or invalid in the request body (for POST requests).
- **404 Not Found**: If the requested resource (e.g., display by ID) is not found.
- **500 Internal Server Error**: For unexpected errors during server processing.

---

Here’s the updated README with the **Image Download** endpoint documentation added:

---

#### **4. Upload an Image**
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

#### **5. Download an Image**
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

#### **6. Initiate a Display**
**POST** `/display/initiate`

##### Description:
Initiates a display by associating it with a MAC address. If a display with the given MAC address already exists, a message is returned indicating that the display is already initiated. If no MAC address is provided, an error message is returned.

##### Request Parameters:
- **macAddress** (String, required): The MAC address of the display.

##### Request Example:
```http
POST /display/initiate
Content-Type: application/x-www-form-urlencoded

macAddress=00:1B:44:11:3A:B7
```

##### Response:
- **200 OK**:
  - If the display is successfully initiated (new display created): `"Display initiated with mac-address: 00:1B:44:11:3A:B7"`
  - If the display with the provided MAC address already exists: `"Display with mac-address: 00:1B:44:11:3A:B7 is already initiated."`

- **400 Bad Request**:
  - If no MAC address is provided: `"Error: No MAC address was given."`

##### Notes:
- This endpoint checks if a display with the provided MAC address already exists in the database. If it does, it returns a message indicating that the display has already been initiated.
- If the MAC address is new, the display is created and saved in the database.
- If no MAC address is provided, the system returns an error message indicating the missing parameter.

---