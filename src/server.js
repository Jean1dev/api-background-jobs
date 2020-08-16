require('dotenv-extended').load()
const express = require('express')
const BullBoard = require('bull-board')
const Queue = require('./queue/index')
const TaskController = require('./modules/tasks/TaskController')
const port = process.env.PORT || 8090

const app = express();
BullBoard.setQueues(Queue.queues.map(queue => queue.bull));

app.use(express.json());

app.use('/admin', BullBoard.UI);
app.post('/task', TaskController.store)
app.post('/remove-s3-file', TaskController.removeS3file)

app.listen(port, () => {
  console.log('Server running on localhost:', port);
});