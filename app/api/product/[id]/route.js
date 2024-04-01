import Product from "@models/product";
import { connectToDB } from "@utils/database";

export async function GET(request, { params }) {
  try {
    await connectToDB();

    const product = await Product.findById(params.id);
    if (!product) return new Response("Product Not Found", { status: 404 });

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}