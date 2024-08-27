"use client";

import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";

// GraphQL Queries
const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $price: Float!) {
    createProduct(createProductInput: { name: $name, price: $price }) {
      id
      name
      price
    }
  }
`;

const PRODUCT_ADDED = gql`
  subscription ProductAdded {
    productAdded {
      id
      name
      price
    }
  }
`;

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<any>([]);

  const { loading, error } = useQuery(GET_PRODUCTS, {
    onCompleted: (data) => {
      // Inicializa a lista de produtos com os dados da query
      setProducts(data.products || []);
    },
  });

  useSubscription(PRODUCT_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      // Atualiza a lista de produtos automaticamente com o novo produto adicionado
      if (subscriptionData.data?.productAdded) {
        setProducts((prevProducts: any) => [
          ...prevProducts,
          subscriptionData.data.productAdded,
        ]);
      }
    },
  });

  const [createProduct] = useMutation(CREATE_PRODUCT);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await createProduct({ variables: { name, price: parseFloat(price) } });
    setName("");
    setPrice("");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <ul className="list-disc pl-5">
        {products?.map((product: any) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
