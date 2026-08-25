const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export async function getProducts(params = "", noCache = false) {
  const fetchOptions: RequestInit = noCache 
    ? { cache: "no-store" } 
    : { next: { revalidate: 60 } };

  const response = await fetch(
    `${API_URL}/products${params}`,
    fetchOptions
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProduct(slug: string, noCache = false) {
  const fetchOptions: RequestInit = noCache 
    ? { cache: "no-store" } 
    : { next: { revalidate: 60 } };

  const response = await fetch(
    `${API_URL}/products/${slug}`,
    fetchOptions
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

export async function createProduct(productData: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-admin-token') : null;

  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create product");
  }

  return response.json();
}

export async function loginUser(credentials: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to login");
  }

  return response.json();
}

export async function registerUser(credentials: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to register");
  }

  return response.json();
}

export async function updateProduct(id: string, productData: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-admin-token') : null;

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update product");
  }

  return response.json();
}

export async function deleteProduct(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-admin-token') : null;

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete product");
  }

  return response.json();
}

export async function restoreProduct(id: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-admin-token') : null;

  const response = await fetch(`${API_URL}/products/${id}/restore`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to restore product");
  }

  return response.json();
}

export async function uploadImages(files: FileList) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-admin-token') : null;
  const formData = new FormData();
  
  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload images");
  }

  return response.json();
}

// ----------------------------------------------------
// ORDERS & PAYMENT
// ----------------------------------------------------

export async function getRazorpayKey() {
  const response = await fetch(`${API_URL}/orders/config/razorpay`);
  if (!response.ok) throw new Error("Failed to fetch Razorpay key");
  const data = await response.json();
  return data.clientId;
}

export async function placeOrder(orderData: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-token') : null;
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create order");
  }

  return response.json();
}

export async function verifyPayment(paymentData: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jerseyspot-token') : null;
  const response = await fetch(`${API_URL}/orders/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to verify payment");
  }

  return response.json();
}

// ----------------------------------------------------
// NEW ADDITIONS
// ----------------------------------------------------

export async function getOrders(noCache = false) {
  // Use either admin token or normal token
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem("jerseyspot-admin-token") || localStorage.getItem("jerseyspot-token");
  }
  
  const fetchOptions: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 60 } };
  
  const response = await fetch(`${API_URL}/orders`, {
    ...fetchOptions,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function getSiteConfig(noCache = false) {
  const fetchOptions: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 60 } };
  const response = await fetch(`${API_URL}/config/site`, fetchOptions);
  
  if (!response.ok) {
    throw new Error("Failed to fetch site config");
  }

  return response.json();
}

export async function updateSiteConfig(configData: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("jerseyspot-admin-token") : null;
  const response = await fetch(`${API_URL}/config/site`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(configData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update site config");
  }

  return response.json();
}

export async function getMyOrders(noCache = false) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem("jerseyspot-token");
  }
  
  const fetchOptions: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 60 } };
  
  const response = await fetch(`${API_URL}/orders/myorders`, {
    ...fetchOptions,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user orders");
  }

  return response.json();
}

export async function updateDeliveryStatus(orderId: string, status: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("jerseyspot-admin-token") : null;
  
  const response = await fetch(`${API_URL}/orders/${orderId}/deliverystatus`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update delivery status");
  }

  return response.json();
}