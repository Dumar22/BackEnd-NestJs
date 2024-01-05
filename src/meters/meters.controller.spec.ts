import { Test, TestingModule } from '@nestjs/testing';
import { MetersController } from './meters.controller';
import { MetersService } from './meters.service';

describe('MetersController', () => {
  let controller: MetersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetersController],
      providers: [MetersService],
    }).compile();

    controller = module.get<MetersController>(MetersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
