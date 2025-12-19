import { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; // We need to install this!
import { supabase } from '../config/supabase';
import { registerSchema } from '../utils/validation';
import jwt from 'jsonwebtoken';



export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Check if Mentor is approved
    if (user.role === 'mentor' && !user.is_approved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Payload
      process.env.JWT_SECRET as string,     // Secret
      { expiresIn: '1d' }                   // Expiry
    );

    // 5. Return Token + User Info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      message: 'Login successful', 
      token, 
      user: userWithoutPassword 
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate Input
    const result = registerSchema.safeParse(req.body);
    
    if (!result.success) {
      // FIX: Use .format() instead of .errors for better type safety and cleaner API response
      return res.status(400).json({ error: result.error.format() });
    }

    const { email, password, role } = result.data;

    // 2. Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash Password (Manual hashing since we bypass Supabase Auth)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert into DB
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          role: role || 'student',
          is_approved: role === 'mentor' ? false : true // Mentors need approval
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'User registered successfully', user: data });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};