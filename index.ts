import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';

const connection: ConnectionOptions = {
	host: '127.0.0.1',
	port: 6379,
};

// Визначення енумів для імен черг і завдань
enum QueueNames {
	EXAMPLE_QUEUE = 'example-queue',
}

enum JobNames {
	EXAMPLE_JOB = 'example-job',
	EXAMPLE_JOB_2 = 'example-job-2',
}

// Визначення інтерфейсів для даних кожної задачі
interface ExampleJobData {
	type: JobNames.EXAMPLE_JOB;
	message: string;
}

interface ExampleJob2Data {
	type: JobNames.EXAMPLE_JOB_2;
	number: number;
	text: string;
}

type JobData = ExampleJobData | ExampleJob2Data;

// Створення черги
const queue = new Queue(QueueNames.EXAMPLE_QUEUE, { connection });

// Додавання завдання до черги
async function addJobToQueue(data: JobData) {
	const options = {
		[JobNames.EXAMPLE_JOB]: { attempts: 3, backoff: 1000 },
		[JobNames.EXAMPLE_JOB_2]: { attempts: 5, backoff: 500 },
	};

	await queue.add(data.type, data, options[data.type]);
	console.log(
		`-------------------------------------\n+ Job ${data.type} added to queue +\n+++++++++++++++++++++++++++++++++++++`
	);
}

// Створення робітника для обробки завдань
const worker = new Worker(
	QueueNames.EXAMPLE_QUEUE,
	async (job: Job) => {
		let data: ExampleJobData | ExampleJob2Data;
		console.log(`Worker processing --> job name: ${job.name}`);
		console.log(`Processing job: ${job.id}`);

		switch (job.name) {
			case JobNames.EXAMPLE_JOB:
				data = job.data as ExampleJobData;
				console.log(`Job data: ${data.message}`);
				break;

			case JobNames.EXAMPLE_JOB_2:
				data = job.data as ExampleJob2Data;
				console.log(`Job data: ${data.number}, ${data.text}`);
				break;

			default:
				console.log(`No handler found for job: ${job.name}`);
				break;
		}

		// Симуляція обробки завдання
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log(`Job ${job.id} completed`);
	},
	{ connection }
);

// Запуск робітника
function logJobEvent(event: string, job: Job) {
	console.log(
		`[${event}] Job ID: ${job.id}, Name: ${job.name}, Data: ${JSON.stringify(
			job.data
		)}\n---------------------------------------------------------------------`
	);
}

worker.on('completed', (job: Job) => logJobEvent('completed', job));
worker.on('failed', (job: Job | undefined, err: Error) => {
	console.error(`[failed] Job ID: ${job?.id}, Error: ${err.message}`);
});

// Додавання завдань до черги
addJobToQueue({ type: JobNames.EXAMPLE_JOB, message: 'Hello, BullMQ!' }).catch(
	console.error
);
addJobToQueue({
	type: JobNames.EXAMPLE_JOB_2,
	number: 42,
	text: 'Text in job 2',
}).catch(console.error);
