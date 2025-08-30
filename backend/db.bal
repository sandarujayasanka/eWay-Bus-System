import ballerinax/mysql;

mysql:Client dbClient = check new ("localhost", "root", "password", "epass_system");
