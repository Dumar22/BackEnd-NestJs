import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentMaterialsVehicleService } from './assignment-materials-vehicle.service';

describe('AssignmentMaterialsVehicleService', () => {
  let service: AssignmentMaterialsVehicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentMaterialsVehicleService],
    }).compile();

    service = module.get<AssignmentMaterialsVehicleService>(AssignmentMaterialsVehicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
