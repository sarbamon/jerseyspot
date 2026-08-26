"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type StoreProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  team: string;
  sizes: { size: string; stock: number }[];
};

export type CartItem = StoreProduct & {
  size: string;
  quantity: number;
};

type StoreContextType = {
  cart: CartItem[];
  wishlist: StoreProduct[];

  addToCart: (product: StoreProduct, size: string) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (
    id: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;

  toggleWishlist: (product: StoreProduct) => void;
  isWishlisted: (id: string) => boolean;

  cartCount: number;
  wishlistCount: number;

  isAuthenticated: boolean;
  isInitialized: boolean;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;

  isLoginModalOpen: boolean;
  showLoginModal: () => void;
  closeLoginModal: () => void;
};

const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

export function StoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("jerseyspot-cart");
    const savedWishlist = localStorage.getItem(
      "jerseyspot-wishlist"
    );

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    const auth = localStorage.getItem("jerseyspot-auth");
    const savedUser = localStorage.getItem("jerseyspot-user");
    if (auth === "true") {
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {}
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      "jerseyspot-cart",
      JSON.stringify(cart)
    );
  }, [cart, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      "jerseyspot-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist, isInitialized]);

  const addToCart = (
    product: StoreProduct,
    size: string
  ) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item._id === product._id &&
          item.size === size
      );

      if (existing) {
        return currentCart.map((item) =>
          item._id === product._id &&
          item.size === size
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          size,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (
    id: string,
    size: string
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(item._id === id && item.size === size)
      )
    );
  };

  const updateQuantity = (
    id: string,
    size: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(id, size);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item._id === id && item.size === size
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (
    product: StoreProduct
  ) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item._id === product._id
      );

      if (exists) {
        return currentWishlist.filter(
          (item) => item._id !== product._id
        );
      }

      return [...currentWishlist, product];
    });
  };

  const isWishlisted = (id: string) => {
    return wishlist.some(
      (item) => item._id === id
    );
  };

  const login = (token: string, userData: any) => {
    localStorage.setItem("jerseyspot-auth", "true");
    localStorage.setItem("jerseyspot-token", token);
    localStorage.setItem("jerseyspot-user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("jerseyspot-auth");
    localStorage.removeItem("jerseyspot-token");
    localStorage.removeItem("jerseyspot-user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const showLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount: cart.reduce(
          (total, item) => total + item.quantity,
          0
        ),
        wishlistCount: wishlist.length,
        isAuthenticated,
        isInitialized,
        user,
        login,
        logout,
        isLoginModalOpen,
        showLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(
      "useStore must be used inside StoreProvider"
    );
  }

  return context;
}