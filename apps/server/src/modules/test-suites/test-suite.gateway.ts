import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WSExceptionFilter } from 'src/pipes/WSException.filter';
import { WSValidationPipe } from 'src/pipes/WSValidation.pipe';
import { TestSuitesService } from './test-suites.service';
import { ExecuteTestSuiteDto } from './dtos/execute-testcase.dto';
import puppeteer from 'puppeteer';

@UseFilters(WSExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: ['http://127.0.0.1:3003'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class TestSuiteGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(private testSuiteService: TestSuitesService) {}
  private readonly logger = new Logger('BrowserGateway');

  async onModuleInit() {
    this.logger.log('Gateway initialized');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    socket.emit('idk', 'connected');
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  //   executeTestSuite
  @SubscribeMessage(`execute-test-suite`)
  async executeTestSuite(
    @MessageBody(new WSValidationPipe()) payload: ExecuteTestSuiteDto,
    @ConnectedSocket() socket: Socket
  ): Promise<any> {
    try {
      const { testSuiteId, organizationId } = payload;
      this.testSuiteService.executeTestSuite(testSuiteId, organizationId, socket);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
