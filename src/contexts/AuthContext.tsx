
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { RegisteredUser } from '@/types';

type AuthRole = 'admin' | 'student' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: AuthRole;
  userId: string | null; // Added userId
  userName: string | null;
  login: (email: string, passwordOrRole: string, role?: 'admin' | 'student') => boolean;
  logout: () => void;
  registerStudent: (name: string, email: string, password: string) => { success: boolean; message: string };
  updateStudentFaceDataStatus: (userId: string, isRegistered: boolean) => { success: boolean; message: string };
  isLoadingAuth: boolean;
  registeredUsers: RegisteredUser[];
  getLoggedInUser: () => RegisteredUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REGISTERED_USERS_KEY = 'registeredUsers';
const AUTH_KEY = 'auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<AuthRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) {
          const {
            isAuthenticated: storedIsAuthenticated,
            userRole: storedUserRole,
            userName: storedUserName,
            userId: storedUserId, // Load userId
          } = JSON.parse(storedAuth);
          setIsAuthenticated(storedIsAuthenticated);
          setUserRole(storedUserRole);
          setUserName(storedUserName);
          setUserId(storedUserId);
        }

        const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
        if (storedUsers) {
          setRegisteredUsers(JSON.parse(storedUsers));
        } else {
          // Initialize with an empty array if no users are stored
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([]));
        }
      } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(REGISTERED_USERS_KEY);
      } finally {
        setIsLoadingAuth(false);
      }
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = (email: string, passwordOrRole: string, roleInput?: 'admin' | 'student'): boolean => {
    setIsLoadingAuth(true);
    let actualRole: 'admin' | 'student';
    let passwordToCheck: string;

    if (roleInput) { 
        actualRole = roleInput;
        passwordToCheck = passwordOrRole;
    } else { 
        actualRole = passwordOrRole as 'admin' | 'student'; 
        passwordToCheck = actualRole === 'student' ? 'password' : 'adminpass'; // Default passwords if not provided
    }


    if (actualRole === 'admin') {
      if (email === 'admin@example.com' && passwordToCheck === 'adminpass') {
        const adminAuthData = { isAuthenticated: true, userRole: 'admin', userName: 'Admin', userId: 'admin-user-001' };
        setIsAuthenticated(true);
        setUserRole('admin');
        setUserName('Admin');
        setUserId('admin-user-001'); // Arbitrary admin ID
        localStorage.setItem(AUTH_KEY, JSON.stringify(adminAuthData));
        
        const queryParams = new URLSearchParams(window.location.search);
        const redirectPath = queryParams.get('redirect');
        router.push(redirectPath || '/dashboard');
        setIsLoadingAuth(false);
        return true;
      }
    } else if (actualRole === 'student') {
      const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'student');
      if (user && user.password === passwordToCheck) {
        const studentAuthData = { isAuthenticated: true, userRole: 'student', userName: user.name, userId: user.id };
        setIsAuthenticated(true);
        setUserRole('student');
        setUserName(user.name);
        setUserId(user.id); // Store user's actual ID
        localStorage.setItem(AUTH_KEY, JSON.stringify(studentAuthData));
        
        const queryParams = new URLSearchParams(window.location.search);
        const redirectPath = queryParams.get('redirect');
        router.push(redirectPath || '/student-dashboard');
        setIsLoadingAuth(false);
        return true;
      }
    }
    
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    localStorage.removeItem(AUTH_KEY);
    setIsLoadingAuth(false);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    setIsLoadingAuth(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
    router.push('/');
  };

  const registerStudent = (name: string, email: string, password: string): { success: boolean; message: string } => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { success: false, message: "All fields are required." };
    }
    if (registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "This email is already registered." };
    }

    const newUser: RegisteredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, 
      role: 'student',
      faceDataRegistered: false, // Initially false, student needs to "register face"
    };

    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    return { success: true, message: "Registration successful! Please login and then register your face data on your dashboard." };
  };

  const updateStudentFaceDataStatus = useCallback((studentId: string, isRegistered: boolean): { success: boolean; message: string } => {
    const userIndex = registeredUsers.findIndex(u => u.id === studentId && u.role === 'student');
    if (userIndex === -1) {
      return { success: false, message: "Student not found." };
    }
    const updatedUsers = [...registeredUsers];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], faceDataRegistered: isRegistered };
    
    setRegisteredUsers(updatedUsers);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    
    // If the updated user is the currently logged-in user, update their auth state too (if needed for immediate UI changes)
    // This is more for reflecting the change on the dashboard immediately if we read from a live user object.
    // However, `getLoggedInUser` will now reflect this change.

    return { success: true, message: `Face data status updated to: ${isRegistered ? 'Registered' : 'Not Registered'}.` };
  }, [registeredUsers]);

  const getLoggedInUser = useCallback((): RegisteredUser | null => {
    if (!isAuthenticated || !userId || userRole !== 'student') {
      return null;
    }
    return registeredUsers.find(u => u.id === userId) || null;
  }, [isAuthenticated, userId, userRole, registeredUsers]);


  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userId, 
      userName, 
      login, 
      logout, 
      registerStudent, 
      updateStudentFaceDataStatus,
      isLoadingAuth, 
      registeredUsers,
      getLoggedInUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
