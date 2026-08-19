import {
	LEGACY_CATALOGUE_KEYS,
	LocalStorageService,
	MAX_APP_STORAGE_BYTES,
	MAX_STORAGE_ITEM_BYTES
} from './local-storage.service';

describe('LocalStorageService', () => {
	let service: LocalStorageService;

	beforeEach(() => {
		localStorage.clear();
		service = new LocalStorageService();
	});

	afterEach(() => localStorage.clear());

	it('stores small versioned values', () => {
		expect(service.setItem('theme', { name: 'dark' })).toBeTrue();
		expect(service.getItem('theme')).toEqual({ name: 'dark' });
	});

	it('rejects values above the documented item limit', () => {
		const value = 'x'.repeat(MAX_STORAGE_ITEM_BYTES + 1);

		expect(service.setItem('catalogue', value)).toBeFalse();
		expect(service.getItem('catalogue')).toBeNull();
	});

	it('bounds total application storage across keys', () => {
		const results = Array.from({ length: 10 }, (_, index) =>
			service.setItem(`preference-${index}`, 'x'.repeat(MAX_STORAGE_ITEM_BYTES - 100))
		);
		const totalBytes = Object.keys(localStorage)
			.filter(key => key.startsWith('wmca:v1:'))
			.reduce((total, key) => total + new Blob([key, localStorage.getItem(key) || '']).size, 0);

		expect(results).toContain(false);
		expect(totalBytes).toBeLessThanOrEqual(MAX_APP_STORAGE_BYTES);
	});

	it('removes corrupt and stale values instead of throwing', () => {
		localStorage.setItem('wmca:v1:corrupt', '{not-json');
		localStorage.setItem('wmca:v1:stale', JSON.stringify({ version: 0, value: 'old' }));

		expect(service.getItem('corrupt')).toBeNull();
		expect(service.getItem('stale')).toBeNull();
		expect(localStorage.getItem('wmca:v1:corrupt')).toBeNull();
		expect(localStorage.getItem('wmca:v1:stale')).toBeNull();
	});

	it('treats quota failures as a cache miss', () => {
		spyOn(Storage.prototype, 'setItem').and.throwError(
			new DOMException('Quota exceeded', 'QuotaExceededError')
		);

		expect(service.setItem('theme', 'dark')).toBeFalse();
	});

	it('loads when browser storage access is denied', () => {
		spyOn(Storage.prototype, 'getItem').and.throwError(new DOMException('Access denied', 'SecurityError'));

		expect(service.getItem('theme')).toBeNull();
	});

	it('removes catalogue payloads written by older versions', () => {
		for (const key of LEGACY_CATALOGUE_KEYS) {
			localStorage.setItem(key, 'large catalogue');
		}

		service.removeLegacyCatalogueEntries();

		for (const key of LEGACY_CATALOGUE_KEYS) {
			expect(localStorage.getItem(key)).toBeNull();
		}
	});
});
