import ballerina/http;
import ballerinax/mysql;
import ballerina/crypto;
import ballerina/log;
import ballerina/sql;

// Configurable DB connection details
configurable string DB_HOST = "localhost";
configurable string DB_USER = "root";
configurable string DB_PASSWORD = "";
configurable string DB_NAME = "epass_system";
configurable int DB_PORT = 3306;

// Primary MySQL client (declare only once)
final mysql:Client otherdbClient = check new mysql:Client(
    host = DB_HOST,
    port = DB_PORT,
    user = DB_USER,
    password = DB_PASSWORD,
    database = DB_NAME
);

// Port 8081 listener
listener http:Listener userListener = new(8081);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization", "Cookie"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /user on userListener {
    
    // Register endpoint
    resource function post register(http:Caller caller, http:Request req) returns error? {
        do {
            json payload = check req.getJsonPayload();
            string username = check payload.username.ensureType();
            string email = check payload.email.ensureType();
            string password = check payload.password.ensureType();

            byte[] hashedBytes = crypto:hashSha256(password.toBytes());
            string hashedPassword = hashedBytes.toBase16();

            sql:ParameterizedQuery insertUserQuery = `INSERT INTO users(username, email, password) VALUES (${username}, ${email}, ${hashedPassword})`;
            _ = check otherdbClient->execute(insertUserQuery);
            _ = check caller->respond({ "status": "success", "message": "User registered successfully" });
        } on fail var e {
            log:printError("Registration failed: " + e.message());
            _ = check caller->respond({ "status": "error", "message": "Failed to register user" });
        }
    }

    // Login endpoint - FIXED (returns cookie via header)
    resource function post login(http:Caller caller, http:Request req) returns error? {
        do {
            json payload = check req.getJsonPayload();
            string email = check payload.email.ensureType();
            string password = check payload.password.ensureType();

            stream<record {}, error?> resultStream = otherdbClient->query(`SELECT id, username, email, password, role FROM users WHERE email = ${email}`);
            record {}[] users = check from var user in resultStream select user;
            
            if users.length() == 0 {
                _ = check caller->respond({ "status": "error", "message": "Invalid email or password" });
                return;
            }
            
            record {} user = users[0];
            string dbPassword = check user["password"].ensureType();
            string role = check user["role"].ensureType();
            string username = check user["username"].ensureType();

            byte[] hashedBytes = crypto:hashSha256(password.toBytes());
            string hashedPassword = hashedBytes.toBase16();

            if dbPassword == hashedPassword {
                http:Response res = new;
                // Manually set a cookie header since 'setCookie' isn't available.
                // NOTE: 'encodeUriComponent' is also not available, so we use a simple approach.
                res.setHeader("Set-Cookie", "user_email=" + email + "; Path=/; HttpOnly; SameSite=Lax");
                
                res.setPayload({
                    "status": "success", 
                    "role": role, 
                    "username": username,
                    "message": "Login successful"
                });
                _ = check caller->respond(res);

            } else {
                _ = check caller->respond({ "status": "error", "message": "Invalid email or password" });
            }
        } on fail var e {
            log:printError("Login failed: " + e.message());
            _ = check caller->respond({ "status": "error", "message": "Login failed" });
        }
    }
    
    // User profile endpoint - FIXED (reads cookie via header)
    resource function get profile(http:Caller caller, http:Request req) returns error? {
        // Manually parse the cookie header since 'getCookie' isn't available
        string|http:HeaderNotFoundError cookieHeader = req.getHeader("Cookie");
        string? loggedInEmail = ();
        
        if cookieHeader is string {
            // Find the "user_email" cookie value without using 'split'
            int? startIndex = cookieHeader.indexOf("user_email=");
            if (startIndex is int) { // Check if a value was found
                int startValueIndex = startIndex + 11;
                int? endIndex = cookieHeader.indexOf(";", startValueIndex);
                
                if (endIndex is int) {
                    loggedInEmail = cookieHeader.substring(startValueIndex, endIndex);
                } else {
                    // If there is no semicolon, get the rest of the string
                    loggedInEmail = cookieHeader.substring(startValueIndex);
                }
            }
        }

        if (loggedInEmail is ()) {
            http:Response res = new;
            res.statusCode = 401;
            res.setPayload({ "status": "error", "message": "Unauthorized: No session cookie" });
            _ = check caller->respond(res);
            return;
        }

        // --- FETCH USER DATA FROM DB ---
        stream<record {}, error?> resultStream = otherdbClient->query(
            `SELECT username, email FROM users WHERE email = ${loggedInEmail}`
        );
        record {}[] users = check from var user in resultStream select user;
        
        if users.length() == 0 {
            http:Response res = new;
            res.statusCode = 404;
            res.setPayload({ "status": "error", "message": "User not found" });
            _ = check caller->respond(res);
            return;
        }
        
        record {} user = users[0];
        string username = check user["username"].ensureType();
        string email = check user["email"].ensureType();

        // --- RESPOND WITH THE REAL USER DATA ---
        json userProfile = {
            "username": username,
            "email": email
        };
        _ = check caller->respond(userProfile);
    }
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api on userListener {
    
    resource function options saveTicket(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true"); 
        _ = check caller->respond(res);
    }

    resource function post saveTicket(http:Caller caller, http:Request req) returns error? {
        do {
            json payload = check req.getJsonPayload();
            log:printInfo("Received ticket data: " + payload.toString());
            // ... (rest of the saveTicket logic)
            string ticketId = check payload.ticketId.ensureType();
            string name = check payload.name.ensureType();
            string ticketType = check payload.'type.ensureType();
            string startLoc = check payload.startLocation.ensureType();
            string endLoc = check payload.endLocation.ensureType();
            string duration = check payload.duration.ensureType();
            string startDate = check payload.startDate.ensureType();
            string endDate = check payload.endDate.ensureType();
            decimal price = check payload.price.ensureType();
            string payment = check payload.payment.ensureType();
            string issued = check payload.issued.ensureType();
            string validUntil = check payload.validUntil.ensureType();
            string status = check payload.status.ensureType();
            int createdBy = check payload.createdBy.ensureType();
            
            string route = startLoc + " - " + endLoc;

            sql:ParameterizedQuery insertQuery = `INSERT INTO epass (ticketId, name, type, route, duration, startDate, endDate, price, payment, issued, validUntil, status, createdBy) VALUES (${ticketId}, ${name}, ${ticketType}, ${route}, ${duration}, ${startDate}, ${endDate}, ${price}, ${payment}, ${issued}, ${validUntil}, ${status}, ${createdBy})`;
            
            sql:ExecutionResult result = check otherdbClient->execute(insertQuery);
            
            log:printInfo("Ticket saved successfully: " + ticketId + ", Affected rows: " + result.affectedRowCount.toString());
            
            http:Response res = new;
            res.setPayload({ 
                "status": "success", 
                "message": "Ticket saved successfully",
                "ticketId": ticketId 
            });
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            _ = check caller->respond(res);

        } on fail var e {
            log:printError("Save ticket failed: " + e.message());
            
            http:Response res = new;
            res.setPayload({ 
                "status": "error", 
                "message": "Failed to save ticket: " + e.message()
            });
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            _ = check caller->respond(res);
        }
    }
}

service /admin on userListener {

    resource function get allData(http:Caller caller, http:Request req) returns error? {
        json response = {};

        stream<record {}, error?> ticketStream =
            otherdbClient->query(`SELECT * FROM epass`);
        record {}[] tickets = check from var ticket in ticketStream select ticket;

        stream<record {}, error?> userStream =
            otherdbClient->query(`SELECT * FROM users`);
        record {}[] users = check from var user in userStream select user;

        response = {
            "tickets": <json>tickets,
            "users": <json>users
        };

        http:Response res = new;
        res.setPayload(response);
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        check caller->respond(res);
    }
}


service / on userListener {
    // Handle favicon requests
    resource function get favicon() returns http:Response {
        http:Response res = new;
        res.setPayload("".toBytes());
        res.setHeader("Content-Type", "image/x-icon");
        return res;
    }
}

public function main() {
    // Services will start automatically with the main function execution.
}