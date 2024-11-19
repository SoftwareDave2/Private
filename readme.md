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

