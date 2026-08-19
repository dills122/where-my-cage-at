import { Injectable } from '@angular/core';

const APP_PREFIX = 'wmca:v1:';
const STORAGE_VERSION = 1;
export const MAX_STORAGE_ITEM_BYTES = 4096;
export const MAX_APP_STORAGE_BYTES = 16384;
export const LEGACY_CATALOGUE_KEYS = [
	'filmography',
	'service-provider',
	'EX-filmography',
	'EX-service-provider'
];

interface StorageEnvelope<T> {
	version: number;
	value: T;
}

@Injectable({
	providedIn: 'root'
})
export class LocalStorageService {
	private get storage(): Storage | null {
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}

	setItem<T>(key: string, value: T): boolean {
		try {
			const storage = this.storage;
			if (!storage) {
				return false;
			}
			const storageKey = `${APP_PREFIX}${key}`;
			const serialized = JSON.stringify({ version: STORAGE_VERSION, value });
			if (!serialized || new Blob([serialized]).size > MAX_STORAGE_ITEM_BYTES) {
				return false;
			}

			let totalBytes = new Blob([storageKey, serialized]).size;
			for (let index = 0; index < storage.length; index++) {
				const existingKey = storage.key(index);
				if (existingKey?.startsWith(APP_PREFIX) && existingKey !== storageKey) {
					totalBytes += new Blob([existingKey, storage.getItem(existingKey) || '']).size;
				}
			}
			if (totalBytes > MAX_APP_STORAGE_BYTES) {
				return false;
			}

			storage.setItem(storageKey, serialized);
			return true;
		} catch {
			return false;
		}
	}

	getItem<T>(key: string): T | null {
		const storageKey = `${APP_PREFIX}${key}`;
		try {
			const storage = this.storage;
			const serialized = storage?.getItem(storageKey);
			if (!serialized) {
				return null;
			}
			const envelope = JSON.parse(serialized) as Partial<StorageEnvelope<T>>;
			if (
				envelope === null ||
				typeof envelope !== 'object' ||
				envelope.version !== STORAGE_VERSION ||
				!Object.prototype.hasOwnProperty.call(envelope, 'value')
			) {
				storage?.removeItem(storageKey);
				return null;
			}
			return envelope.value as T;
		} catch {
			this.removeItem(key);
			return null;
		}
	}

	removeItem(key: string) {
		try {
			this.storage?.removeItem(`${APP_PREFIX}${key}`);
		} catch {
			// Storage may be unavailable under browser privacy policies.
		}
	}

	removeLegacyCatalogueEntries() {
		for (const key of LEGACY_CATALOGUE_KEYS) {
			try {
				this.storage?.removeItem(key);
			} catch {
				// Cleanup is best effort when storage access is denied.
			}
		}
	}
}
