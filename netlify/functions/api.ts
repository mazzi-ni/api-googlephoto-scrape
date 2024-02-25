import express, { Router, NextFunction, Request, Response } from "express";
import serverless from "serverless-http";
import axios from 'axios';

const api = express();
const router = Router();
const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9\-_\/]*)"/g

function extractPhotos(content: string): string[] {
  const links = new Set<string>();
  let match: RegExpExecArray | null;
  while (match = regex.exec(content)) {
    links.add(match[1]);
  }
  return Array.from(links);
}

async function getAlbum(id: string): Promise<string[]> {
  const response = await axios.get(`https://photos.app.goo.gl/${id}`);
  // console.log(response.data);

  return extractPhotos(response.data);
}

api.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


router.get("/hello", (req, res) => res.send("Hello World!"));
router.get('/:id', async (req, res) => {
  try {
    const results = await getAlbum(req.params.id);
    res.json(results);
  } catch (e) {
    res.status(500).send();
  }
})

api.use("/api/", router);
export const handler = serverless(api);

