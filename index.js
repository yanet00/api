let express = require("express"); // INSTALLERA MED "npm install express" I KOMMANDOTOLKEN
let app = express();

app.listen(4000);
console.log("Servern körs på port 4000");


const mysql = require("mysql"); // INSTALLERA MED "npm install mysql" I KOMMANDOTOLKEN
con = mysql.createConnection({
  host: "localhost", // databas-serverns IP-adress
  user: "root", // standardanvändarnamn för XAMPP
  password: "", // standardlösenord för XAMPP
  database: "jensen2023", // ÄNDRA TILL NAMN PÅ ER EGEN DATABAS
  multipleStatements: true, // OBS: måste tillåta att vi kör flera sql-anrop i samma query
});

app.use(express.json()); // för att läsa data från klient och för att skicka svar (ersätter bodyparser som vi använt någon gång tidigare)


app.get("/", function (req, res) {
 
});

app.post("/users", function (req, res) {
    // kod för att validera input
    if (!req.body.username) {
      res.status(400).send("username required!");
      return; // avslutar metoden
    }
    let fields = ["username", "password", "email"]; // ändra eventuellt till namn på er egen databastabells kolumner
    for (let key in req.body) {
      if (!fields.includes(key)) {
        res.status(400).send("Unknown field: " + key);
        return; // avslutar metoden
      }
    }
    // kod för att hantera anrop
    let sql = `INSERT INTO users (username, password, email)
      VALUES ('${req.body.username}', 
      '${req.body.password}',
      '${req.body.email}');
      SELECT LAST_INSERT_ID();`; // OBS: innehåller två query: ett insert och ett select
    console.log(sql);
  
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      // kod för att hantera retur av data
      console.log(result);
      let output = {
        id: result[0].insertId,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
      };
      res.send(output);
    });
  });

const COLUMNS =["id", "username", "password", "email"]; // ÄNDRA TILL NAMN PÅ KOLUMNER I ER EGEN TABELL

// grundläggande exempel - returnera en databastabell som JSON
app.get("/users", function (req, res) {
  let sql = "SELECT * FROM users"; // ÄNDRA TILL NAMN PÅ ER EGEN TABELL (om den heter något annat än "users")
  let condition = createCondition(req.query); // output t.ex. " WHERE lastname='Rosencrantz'"
  console.log(sql + condition); // t.ex. SELECT * FROM users WHERE lastname="Rosencrantz"
  // skicka query till databasen
  con.query(sql + condition, function (err, result, fields) {
    res.send(result);
  });
});


// route-parameter, dvs. filtrera efter ID i URL:en
app.get("/users/:id", function (req, res) {
  // Värdet på id ligger i req.params
  let sql = "SELECT * FROM users WHERE id=" + req.params.id;
  console.log(sql);
  // skicka query till databasen
  con.query(sql, function (err, result, fields) {
    if (result.length > 0) {
      res.send(result);
    } else {
      res.sendStatus(404); // 404=not found
    }
  });
});


let createCondition = function (query) {
    // skapar ett WHERE-villkor utifrån query-parametrar
    console.log(query);
    let output = " WHERE ";
    for (let key in query) {
      if (COLUMNS.includes(key)) {
        // om vi har ett kolumnnamn i vårt query
        output += `${key}="${query[key]}" OR `; // t.ex. lastname="Rosencrantz"
      }
    }
    if (output.length == 7) {
      // " WHERE "
      return ""; // om query är tomt eller inte är relevant för vår databastabell - returnera en tom sträng
    } else {
      return output.substring(0, output.length - 4); // ta bort sista " OR "
    }
  };