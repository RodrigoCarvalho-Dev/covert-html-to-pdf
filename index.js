import http from "http";
import { configDotenv } from "dotenv";
import pdfkit from "pdfkit";

configDotenv();

const API_KEY = process.env.API_KEY;

const server = http.createServer( async ( req, res ) => {

    if ( req.method == "POST" && req.url == "/pdf" ){

        const token = req.headers["authorization"];
        if (!token || token !== `Bearer ${API_KEY}`) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Não autorizado" }));
            return;
        }

        let body = "";

        try {

            req.on("data", chunk => {
                body += chunk.toString();
              });            
              
              req.on("end", async () => {
                
                /**
                 * {
                 *   "html" : "...",
                 *   "filename" : "doc.pdf"
                 * }
                 * 
                 */

            const { html, filename } = JSON.parse(body);

            if (!html || !filename) {
                res.writeHead(400, { 
                    "Content-Type": "application/json",
                 });
                res.end(JSON.stringify({ error: "Informe 'html' e 'filename' no JSON" }));
                return;
              }

              const doc = new pdfkit({ size : "A4", margin : 50 });

              let chunks = [];

              doc.on("data", chunck => chunks.push(chunck));
              doc.on("end", () => {
                const pdfBuffer = Buffer.concat(chunks);
                
                res.writeHead( 200, {
                  "content-type" : "application/pdf",
                  "Content-Disposition": `attachment; filename="${filename}.pdf"`,
                });

                res.end(pdfBuffer);
            
              });

              // const cleanText = html
              // .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "") // remove estilos
              // .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") // remove scripts
              // .replace(/<[^>]+>/g, "") // remove tags HTML
              // .replace(/\s+/g, " ") // normaliza espaços
              // .trim();
          
              doc.fontSize(14).text(html, {
                  align: "left",
                  lineGap: 6,
              });

              doc.end();

              console.log('PDF gerado com sucesso!');

              });



        } catch ( error ) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Erro ao gerar PDF", details: err.message }));
        }

    } else {

        res.writeHead(200, {"Content-Type" : "text/html"})
        res.end("<h1>Servidor ativo</h1>")

    }


});

server.listen( 3001, () => {

    console.log("server is running in http://localhost:3000");

})


