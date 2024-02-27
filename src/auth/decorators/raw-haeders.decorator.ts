import { ExecutionContext, createParamDecorator } from "@nestjs/common";




export const RowHeaders = createParamDecorator(
    ( data: string, ctx: ExecutionContext ) => {
        
        const req = ctx.switchToHttp().getRequest();
        
       return req.rawHeaders;
    }
)