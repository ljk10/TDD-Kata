import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1d' }
  );
};

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    
    const isApproved = role === 'student' || process.env.NODE_ENV === 'test';

    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          role,
          is_approved: isApproved 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(data);

    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { id: data.id, email: data.email, role: data.role } 
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

   
    if (!user.is_approved) {
      return res.status(403).json({ message: 'Account pending approval' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};