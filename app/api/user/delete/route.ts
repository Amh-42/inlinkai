import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDatabase } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    // Verify the email matches the current user's email
    if (!email || email !== session.user.email) {
      return NextResponse.json({ 
        error: 'Email verification failed. Please enter your exact email address.' 
      }, { status: 400 });
    }

    console.log('🗑️ Deleting account for user:', session.user.email);

    // Delete the user account directly from the database
    const pool = createDatabase();
    
    try {
      // Start a transaction to ensure all deletions happen atomically
      await pool.query('BEGIN');

      // Delete user sessions first (foreign key constraint)
      await pool.query('DELETE FROM "session" WHERE "userId" = $1', [session.user.id]);
      console.log('✅ Deleted user sessions');

      // Delete user accounts (OAuth connections)
      await pool.query('DELETE FROM "account" WHERE "userId" = $1', [session.user.id]);
      console.log('✅ Deleted user accounts');

      // Delete the user record
      const deleteResult = await pool.query('DELETE FROM "user" WHERE "id" = $1', [session.user.id]);
      console.log('✅ Deleted user record, affected rows:', deleteResult.rowCount);

      // Commit the transaction
      await pool.query('COMMIT');

      console.log('✅ Account deleted successfully for:', session.user.email);

      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (dbError: any) {
      // Rollback the transaction on error
      await pool.query('ROLLBACK');
      console.error('❌ Error deleting user from database:', dbError);
      throw dbError;
    } finally {
      // Close the pool connection
      await pool.end();
    }

  } catch (error: any) {
    console.error('❌ Error deleting user account:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete account. Please try again or contact support.'
    }, { status: 500 });
  }
}
