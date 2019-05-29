#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Servo.h>

const char* ssid ="skylabCodersAcademy";
const char* password = "skylabRocks";
const int DOut1 = 16; //GPIO16 - D0
const int DOut2 = 05; //GPIO05 - D1
const int DOut3 = 04; //GPIO04 - D2
const int servo1Pin = 00; //GPIO00 - D3
const int servo2Pin = 02; //GPIO02 - D4
const int servo3Pin = 14; //GPIO14 - D5
const int Din1 = 12; //GPIO12 - D6
const int Din2 = 13; //GPIO13 - D7
const int Din3 = 15; //GPIO15 - D8
const int analog = A0;
boolean analog_def = false; //if its false analog is input if its true is output

Servo servo1;
Servo servo2;
Servo servo3;

ESP8266WebServer server(80);

void DOut_on(){
   String NUM = server.arg("pin");
   int num = NUM.toInt();
   switch (num)
   {
   case 1:
      digitalWrite(DOut1, HIGH);
      server.send(200, "text/plain", "DOut1 ON");
      break;
   case 2:
      digitalWrite(DOut2, HIGH);
      server.send(200, "text/plain", "DOut2 ON");
      break;
   case 3:
      digitalWrite(DOut3, HIGH);
      server.send(200, "text/plain", "DOut3 ON");
      break;
   default:
      server.send(400, "text/plain", "error: bad DOut request");
   }
}

void DOut_off(){
 String NUM = server.arg("pin");
   int num = NUM.toInt();
   switch (num)
   {
   case 1:
      digitalWrite(DOut1, LOW);
      server.send(200, "text/plain", "DOut1 OFF");
      break;
   case 2:
      digitalWrite(DOut2, LOW);
      server.send(200, "text/plain", "DOut2 OFF");
      break;
   case 3:
      digitalWrite(DOut3, LOW);
      server.send(200, "text/plain", "DOut3 OFF");
      break;
   default:
      server.send(400, "text/plain", "error: bad DOut request");
   }
}

void handleServo1(){
  String POS = server.arg("POS");
  int pos = POS.toInt();
  if(pos<5){
    pos=5;
  }
  if(pos>175){
    pos=175;
  }
  servo1.write(pos);   // tell servo to go to position
  delay(15);
  Serial.print("Servo1 Angle:");
  Serial.println(pos);
  server.send(200, "text/plane","servo1 ok");
}

void handleServo2(){
  String POS = server.arg("POS");
  int pos = POS.toInt();
  if(pos<5){
    pos=5;
  }
  if(pos>175){
    pos=175;
  }
  servo2.write(pos);   // tell servo to go to position
  delay(15);
  Serial.print("Servo2 Angle:");
  Serial.println(pos);
  server.send(200, "text/plane","servo2 ok");
}

void handleServo3(){

  String POS = server.arg("POS");
  int pos = POS.toInt();
  if(pos<5){
    pos=5;
  }
  if(pos>175){
    pos=175;
  }
  servo3.write(pos);   // tell servo to go to position
  delay(15);
  Serial.print("Servo3 Angle:");
  Serial.println(pos);
  server.send(200, "text/plane","servo3 ok");
}

void AnalogOut()
{
}

void info() {
 server.send(200, "text/plain", "HELLO WORLD!");
}

void no_encontrado() {
 server.send(404,"text/plain","Error en la petición");
}

void setup() {
 //inicializa el los DOut
 pinMode (DOut1,OUTPUT);
 pinMode (DOut2,OUTPUT);
 pinMode (DOut3,OUTPUT);
 //inicializa el puerto serie
 Serial.begin(115200);
 delay(10);
 
 //Inicializa el módulo wifi
 WiFi.mode(WIFI_STA); //Establece el módulo como cliente wifi
 WiFi.disconnect(); //Se desconecta de cualquier WiFi conectado previamente
 Serial.println();
 //conecta con la red wifi
 Serial.print("Connecting to ");
 Serial.println(ssid);
 WiFi.begin(ssid, password);
 while (WiFi.status() != WL_CONNECTED) {   // Espera por una conexión WiFi
    delay(500);
    Serial.print(".");
 }
 Serial.println("");
 Serial.println("WiFi connected");
 Serial.print("IP address: ");
 Serial.println(WiFi.localIP());

 //definimos los paths
 server.on("/Don",DOut_on);
 server.on("/Doff",DOut_off);
 server.onNotFound(no_encontrado);
 //inicializa el servidor web
 server.begin();
 Serial.println("Servidor HTTP activo");
}

void loop() {
 server.handleClient();

 HTTPClient http;
   //casa
   //http.begin("http://192.168.1.35:5000/api/users/5b2a3bae65651b3bb801af79/arduinos/5b2a3bc765651b3bb801af7a/data");
   //skylab
   http.begin("http://192.168.0.46:5000/api/users/5b2bd1ca48392a3968e37bbc/arduinos/5b2bd28648392a3968e37bbd/data");

   http.addHeader("Content-Type", "application/json");
   int httpCode = http.POST(json);
   
   String payload = http.getString(); 
   Serial.print("POST payload: "); 
   Serial.println(payload);
 
   Serial.println(httpCode); 
   Serial.println(payload);   
   http.end();
}
