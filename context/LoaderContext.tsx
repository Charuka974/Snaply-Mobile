// context/LoaderContext.tsx
import React, { createContext, useState, ReactNode, useContext } from "react"
import {
  View,
  ActivityIndicator,
  Text,
  Animated,
  StyleSheet,
} from "react-native"

interface LoaderContextProps {
  showLoader: (message?: string) => void
  hideLoader: () => void
  isLoading: boolean
  message?: string
}

export const LoaderContext = createContext<LoaderContextProps>({
  showLoader: () => {},
  hideLoader: () => {},
  isLoading: false,
  message: undefined,
})

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>()
  const opacity = useState(new Animated.Value(0))[0]

  const showLoader = (msg?: string) => {
    setMessage(msg)
    setIsLoading(true)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const hideLoader = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsLoading(false)
      setMessage(undefined)
    })
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, isLoading, message }}>
      {children}

      {isLoading && (
        <Animated.View style={[styles.overlay, { opacity }]}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        </Animated.View>
      )}
    </LoaderContext.Provider>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderContainer: {
    backgroundColor: "#18181B", // dark mode
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  message: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
})

// Optional hook for easy use
export const useLoader = () => useContext(LoaderContext)
