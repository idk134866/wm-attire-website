// WM Attire - Local Storage Manager
// All user data saved on device (no database needed)
// Works for web (LocalStorage) and mobile (AsyncStorage)

class WMStorageManager {
    constructor() {
        this.storageKey = 'wmattire_';
        this.isReactNative = typeof window === 'undefined';
        this.AsyncStorage = null;
        
        // Initialize React Native AsyncStorage if available
        if (this.isReactNative) {
            try {
                this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
            } catch (e) {
                console.warn('AsyncStorage not available');
            }
        }
    }

    // CORE STORAGE METHODS

    async save(key, data) {
        try {
            const fullKey = this.storageKey + key;
            const jsonData = JSON.stringify(data);
            
            if (this.isReactNative && this.AsyncStorage) {
                await this.AsyncStorage.setItem(fullKey, jsonData);
            } else {
                localStorage.setItem(fullKey, jsonData);
            }
            return { success: true };
        } catch (error) {
            console.error('Storage save error:', error);
            return { success: false, error: error.message };
        }
    }

    async load(key) {
        try {
            const fullKey = this.storageKey + key;
            let jsonData;
            
            if (this.isReactNative && this.AsyncStorage) {
                jsonData = await this.AsyncStorage.getItem(fullKey);
            } else {
                jsonData = localStorage.getItem(fullKey);
            }
            
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    async delete(key) {
        try {
            const fullKey = this.storageKey + key;
            
            if (this.isReactNative && this.AsyncStorage) {
                await this.AsyncStorage.removeItem(fullKey);
            } else {
                localStorage.removeItem(fullKey);
            }
            return { success: true };
        } catch (error) {
            console.error('Storage delete error:', error);
            return { success: false, error: error.message };
        }
    }

    async clearAll() {
        try {
            if (this.isReactNative && this.AsyncStorage) {
                const keys = await this.AsyncStorage.getAllKeys();
                const wmKeys = keys.filter(k => k.startsWith(this.storageKey));
                await this.AsyncStorage.multiRemove(wmKeys);
            } else {
                Object.keys(localStorage)
                    .filter(key => key.startsWith(this.storageKey))
                    .forEach(key => localStorage.removeItem(key));
            }
            return { success: true };
        } catch (error) {
            console.error('Storage clear error:', error);
            return { success: false, error: error.message };
        }
    }

    // USER PROFILE MANAGEMENT

    async saveUserProfile(profile) {
        const userProfile = {
            name: profile.name,
            email: profile.email,
            createdAt: profile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return await this.save('user_profile', userProfile);
    }

    async getUserProfile() {
        return await this.load('user_profile');
    }

    async updateUserProfile(updates) {
        const current = await this.getUserProfile() || {};
        const updated = {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return await this.save('user_profile', updated);
    }

    // MEASUREMENTS MANAGEMENT

    async saveMeasurements(measurements) {
        const data = {
            chest: measurements.chest,
            waist: measurements.waist,
            hips: measurements.hips,
            height: measurements.height,
            weight: measurements.weight || null,
            inseam: measurements.inseam || null,
            shoulders: measurements.shoulders || null,
            sleeveLength: measurements.sleeveLength || null,
            unit: measurements.unit || 'cm',
            savedAt: new Date().toISOString()
        };
        return await this.save('measurements', data);
    }

    async getMeasurements() {
        return await this.load('measurements');
    }

    async updateMeasurement(field, value) {
        const current = await this.getMeasurements() || {};
        current[field] = value;
        current.savedAt = new Date().toISOString();
        return await this.save('measurements', current);
    }

    // 3D AVATAR DATA

    async saveAvatarData(avatarData) {
        const data = {
            meshData: avatarData.meshData,
            skinTone: avatarData.skinTone || 'default',
            hairStyle: avatarData.hairStyle || 'default',
            bodyType: avatarData.bodyType,
            generatedAt: new Date().toISOString()
        };
        return await this.save('avatar', data);
    }

    async getAvatarData() {
        return await this.load('avatar');
    }

    // BODY SCAN IMAGES (Camera captures)

    async saveScanImage(imageType, imageData) {
        // imageType: 'front', 'side', 'back'
        const data = {
            imageData: imageData, // Base64 or file path
            capturedAt: new Date().toISOString()
        };
        return await this.save(`scan_${imageType}`, data);
    }

    async getScanImage(imageType) {
        return await this.load(`scan_${imageType}`);
    }

    async getAllScanImages() {
        const [front, side, back] = await Promise.all([
            this.getScanImage('front'),
            this.getScanImage('side'),
            this.getScanImage('back')
        ]);
        return { front, side, back };
    }

    // SIZE RECOMMENDATIONS HISTORY

    async saveSizeRecommendation(brand, productType, recommendation) {
        const history = await this.load('size_history') || [];
        
        const entry = {
            brand,
            productType,
            recommendedSize: recommendation.recommendedSize,
            confidence: recommendation.confidence,
            bodyType: recommendation.bodyType,
            savedAt: new Date().toISOString()
        };
        
        history.unshift(entry); // Add to beginning
        
        // Keep only last 50 recommendations
        if (history.length > 50) {
            history.length = 50;
        }
        
        return await this.save('size_history', history);
    }

    async getSizeHistory() {
        return await this.load('size_history') || [];
    }

    async clearSizeHistory() {
        return await this.delete('size_history');
    }

    // FAVORITE ITEMS

    async saveFavorite(item) {
        const favorites = await this.load('favorites') || [];
        
        const favorite = {
            id: item.id || Date.now().toString(),
            brand: item.brand,
            product: item.product,
            size: item.size,
            price: item.price,
            imageUrl: item.imageUrl,
            url: item.url,
            savedAt: new Date().toISOString()
        };
        
        favorites.unshift(favorite);
        return await this.save('favorites', favorites);
    }

    async getFavorites() {
        return await this.load('favorites') || [];
    }

    async removeFavorite(itemId) {
        const favorites = await this.getFavorites();
        const updated = favorites.filter(f => f.id !== itemId);
        return await this.save('favorites', updated);
    }

    // OUTFIT BUILDER SAVES

    async saveOutfit(outfit) {
        const outfits = await this.load('outfits') || [];
        
        const outfitData = {
            id: outfit.id || Date.now().toString(),
            name: outfit.name,
            items: outfit.items, // Array of clothing items
            totalCost: outfit.totalCost,
            createdAt: new Date().toISOString()
        };
        
        outfits.unshift(outfitData);
        return await this.save('outfits', outfits);
    }

    async getOutfits() {
        return await this.load('outfits') || [];
    }

    async deleteOutfit(outfitId) {
        const outfits = await this.getOutfits();
        const updated = outfits.filter(o => o.id !== outfitId);
        return await this.save('outfits', updated);
    }

    // PREFERENCES & SETTINGS

    async savePreferences(prefs) {
        const preferences = {
            measurementUnit: prefs.measurementUnit || 'cm',
            currency: prefs.currency || 'USD',
            notifications: prefs.notifications !== false,
            darkMode: prefs.darkMode || false,
            language: prefs.language || 'en',
            privacyMode: prefs.privacyMode !== false,
            updatedAt: new Date().toISOString()
        };
        return await this.save('preferences', preferences);
    }

    async getPreferences() {
        const defaults = {
            measurementUnit: 'cm',
            currency: 'USD',
            notifications: true,
            darkMode: false,
            language: 'en',
            privacyMode: true
        };
        const saved = await this.load('preferences');
        return { ...defaults, ...saved };
    }

    // SUBSCRIPTION STATUS (Free/Premium)

    async saveSubscription(subscription) {
        const data = {
            plan: subscription.plan, // 'free', 'student', 'pro'
            expiresAt: subscription.expiresAt,
            features: subscription.features,
            savedAt: new Date().toISOString()
        };
        return await this.save('subscription', data);
    }

    async getSubscription() {
        const saved = await this.load('subscription');
        if (!saved) {
            // Default to free plan
            return {
                plan: 'free',
                expiresAt: null,
                features: ['basic_avatar', 'basic_recommendations']
            };
        }
        return saved;
    }

    async isPremium() {
        const sub = await this.getSubscription();
        return sub.plan === 'student' || sub.plan === 'pro';
    }

    // EXPORT/IMPORT USER DATA

    async exportAllData() {
        const [profile, measurements, avatar, history, favorites, outfits, prefs, subscription] = await Promise.all([
            this.getUserProfile(),
            this.getMeasurements(),
            this.getAvatarData(),
            this.getSizeHistory(),
            this.getFavorites(),
            this.getOutfits(),
            this.getPreferences(),
            this.getSubscription()
        ]);
        
        return {
            profile,
            measurements,
            avatar,
            history,
            favorites,
            outfits,
            preferences: prefs,
            subscription,
            exportedAt: new Date().toISOString()
        };
    }

    async importAllData(data) {
        const imports = [];
        
        if (data.profile) imports.push(this.saveUserProfile(data.profile));
        if (data.measurements) imports.push(this.saveMeasurements(data.measurements));
        if (data.avatar) imports.push(this.saveAvatarData(data.avatar));
        if (data.history) imports.push(this.save('size_history', data.history));
        if (data.favorites) imports.push(this.save('favorites', data.favorites));
        if (data.outfits) imports.push(this.save('outfits', data.outfits));
        if (data.preferences) imports.push(this.savePreferences(data.preferences));
        if (data.subscription) imports.push(this.saveSubscription(data.subscription));
        
        const results = await Promise.all(imports);
        return { success: results.every(r => r.success) };
    }

    // STORAGE USAGE INFO

    async getStorageInfo() {
        try {
            const allData = await this.exportAllData();
            const dataSize = JSON.stringify(allData).length;
            const dataSizeKB = (dataSize / 1024).toFixed(2);
            const dataSizeMB = (dataSize / 1024 / 1024).toFixed(2);
            
            return {
                totalItems: Object.keys(allData).length,
                sizeBytes: dataSize,
                sizeKB: dataSizeKB,
                sizeMB: dataSizeMB,
                lastUpdated: allData.profile?.updatedAt || new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message };
        }
    }
}

// Initialize and export
const wmStorage = new WMStorageManager();

// Make available globally
if (typeof window !== 'undefined') {
    window.WMStorage = wmStorage;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WMStorageManager;
}
