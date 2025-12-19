import { supabase } from '../config/supabase';

describe('Database Connection', () => {
  it('should be able to query the users table', async () => {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    expect(error).toBeNull();
    // Since table might be empty, we just check if the query executed without error
    expect(typeof data === 'number' || data === null).toBeTruthy(); 
  });
});