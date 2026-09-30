/**
 * Admin Store
 * 
 * Manages admin profiles, authentication via random Admin IDs,
 * and links rooms/sessions to their creating admin.
 */

export interface AdminProfile {
  adminId: string;         // e.g., "ADMIN-7X9K"
  displayName: string;
  createdAt: string;
  roomIds: string[];       // Session IDs created by this admin
}

class AdminStore {
  private admins: Map<string, AdminProfile> = new Map();

  constructor() {
    // Seed a default admin for the existing KILN-1001 session
    const defaultAdmin: AdminProfile = {
      adminId: "ADMIN-CORE",
      displayName: "DETOX Admin",
      createdAt: new Date().toISOString(),
      roomIds: ["KILN-1001"]
    };
    this.admins.set(defaultAdmin.adminId, defaultAdmin);
  }

  /**
   * Generate a unique Admin ID
   */
  private generateAdminId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullId = `ADMIN-${code}`;
    if (this.admins.has(fullId)) {
      return this.generateAdminId();
    }
    return fullId;
  }

  /**
   * Register a new admin
   */
  register(displayName: string): AdminProfile {
    const adminId = this.generateAdminId();
    const profile: AdminProfile = {
      adminId,
      displayName: displayName || `Admin_${adminId.slice(-4)}`,
      createdAt: new Date().toISOString(),
      roomIds: []
    };
    this.admins.set(adminId, profile);
    return profile;
  }

  /**
   * Login: Validate admin ID exists
   */
  login(adminId: string): AdminProfile | null {
    return this.admins.get(adminId.toUpperCase().trim()) || null;
  }

  /**
   * Get admin profile
   */
  getProfile(adminId: string): AdminProfile | null {
    return this.admins.get(adminId.toUpperCase().trim()) || null;
  }

  /**
   * Link a room to an admin
   */
  addRoom(adminId: string, roomId: string): void {
    const admin = this.admins.get(adminId);
    if (admin && !admin.roomIds.includes(roomId)) {
      admin.roomIds.push(roomId);
    }
  }

  /**
   * Get all room IDs created by an admin
   */
  getRoomIds(adminId: string): string[] {
    const admin = this.admins.get(adminId);
    return admin ? [...admin.roomIds] : [];
  }
}

export const adminStore = new AdminStore();
