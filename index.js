import puppeteer from "puppeteer";
import http from "http";
import { configDotenv } from "dotenv";

configDotenv();

const API_KEY = process.env.API_KEY;

async function convertHtmlToPdf(htmlFileString, pdfFilePath) {
  // Lê o HTML

  // Abre o navegador
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Carrega o HTML
  await page.setContent(htmlFileString, { waitUntil: 'networkidle0' });

  // Gera o PDF
  const pdfFile = await page.pdf({
    path: pdfFilePath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  console.log('PDF gerado com sucesso!');

  return pdfFile;

}

// Exemplo de uso
// convertHtmlToPdf('./documento.html', 'document.pdf');


// definir qual documento irá entrar e qual vai ser o nome do documento de saída

// enviar arquivo html por http

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

                const pdf = await convertHtmlToPdf( html, filename );

                res.writeHead(200, {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": "attachment; filename=" + filename
                  });
                  res.end(pdf);
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

server.listen( 3000, () => {

    console.log("server is running in http://localhost:3000");

})


