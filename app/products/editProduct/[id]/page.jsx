"use client";

import Form from "@components/Form";
import Layout from "@components/Layout";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "@app/firebase";

const EditProduct = ({ params }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: null,
    imageUrls: [],
  });
  const router = useRouter();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/product/${params?.id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            imageUrls: data.imageUrls,
          });
          setProduct(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/product/${product._id}`, {
        method: "PUT",
        body: JSON.stringify({
          id: product._id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          imageUrls: formData.imageUrls,
        }),
      });
      if (res.ok) {
        setLoading(false);
        setError(null);
        router.push("/products");
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };
  return (
    <Layout>
      <Form
        type="Edit Product"
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleImageSubmit={handleImageSubmit}
        handleRemoveImage={handleRemoveImage}
        loading={loading}
        error={error}
        uploading={uploading}
        imageUploadError={imageUploadError}
      />
    </Layout>
  );
};

export default EditProduct;
