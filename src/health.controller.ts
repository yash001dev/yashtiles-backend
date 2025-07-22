import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get("ecs")
  getHealthEcs() {
    return { status: "ok", service: "ecs" };
  }
}
