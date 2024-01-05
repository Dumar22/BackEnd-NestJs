import { Test, TestingModule } from '@nestjs/testing';
import { ProyectsController } from './proyects.controller';
import { ProyectsService } from './proyects.service';

describe('ProyectsController', () => {
  let controller: ProyectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyectsController],
      providers: [ProyectsService],
    }).compile();

    controller = module.get<ProyectsController>(ProyectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
