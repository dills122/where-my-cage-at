export enum MonetizationTypes {
	FREE = 'free',
	ADS = 'ads',
	SUBSCRIPTION = 'flatrate',
	RENT = 'rent',
	BUY = 'buy'
}

export const mapToFriendlyName = (monetizationType: string) => {
	switch (monetizationType) {
		case 'free':
			return 'Free Streaming';
		case 'ads':
			return 'Streaming with Ads';
		case 'flatrate':
			return 'Streaming with Subscription';
		case 'rent':
			return 'Retnal';
		case 'buy':
			return 'Purchase';
		default:
			return '';
	}
};
