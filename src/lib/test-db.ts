import clientPromise from "./db";

export async function insertTestData() {
  const client = await clientPromise;

  const db = client.db(process.env.MONGODB_DB);

  const collection = db.collection("test");
  const result = await collection.insertOne({
    message: "MongoDB is working",
    createdAt: new Date().toLocaleDateString(),
  });

  return result;
}
