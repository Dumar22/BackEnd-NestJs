import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentMaterialsVehicleController } from './assignment-materials-vehicle.controller';
import { AssignmentMaterialsVehicleService } from './assignment-materials-vehicle.service';

describe('AssignmentMaterialsVehicleController', () => {
  let controller: AssignmentMaterialsVehicleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentMaterialsVehicleController],
      providers: [AssignmentMaterialsVehicleService],
    }).compile();

    controller = module.get<AssignmentMaterialsVehicleController>(AssignmentMaterialsVehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
