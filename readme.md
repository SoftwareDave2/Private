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



