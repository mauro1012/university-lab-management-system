import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Resource Service is up and running!';
  }

  // Este endpoint es vital para que AWS mantenga tu instancia viva
  @Get('health')
  getHealth() {
    return { 
      status: 'ok', 
      service: 'resource-service', 
      timestamp: new Date().toISOString() 
    };
  }
}