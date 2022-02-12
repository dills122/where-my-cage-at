export const SEE_MORE_SERVICE_ID = 99999;

export const services = [
	{
		serviceId: 15,
		serviceIcon: 'pi-video',
		serviceName: 'Hulu'
	},
	{
		serviceIcon: 'pi-video',
		serviceName: 'Netflix',
		serviceId: 8
	},
	{
		serviceIcon: 'pi-video',
		serviceName: 'HBO Max',
		serviceId: 384
	},
	{
		serviceIcon: 'pi-ellipsis-h',
		serviceName: 'See More',
		serviceId: SEE_MORE_SERVICE_ID
	}
];

export interface ServiceInfo {
	serviceName: string;
	serviceIcon: string;
	serviceId: number;
}
