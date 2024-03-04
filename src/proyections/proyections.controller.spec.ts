import { Test, TestingModule } from '@nestjs/testing';
import { ProyectionsController } from './proyections.controller';
import { ProyectionsService } from './proyections.service';

describe('ProyectionsController', () => {
  let controller: ProyectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProyectionsController],
      providers: [ProyectionsService],
    }).compile();

    controller = module.get<ProyectionsController>(ProyectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
