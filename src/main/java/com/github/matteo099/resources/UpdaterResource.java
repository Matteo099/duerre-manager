package com.github.matteo099.resources;

import org.jboss.logging.Logger;

import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.updater.AppLifecycleBean;
import com.github.matteo099.updater.UpdaterService;

import jakarta.inject.Inject;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/updater-controller")
public class UpdaterResource {
    @Inject
    AppLifecycleBean appLifecycleBean;

    @Inject
    UpdaterService updaterService;

    @Inject
    Logger logger;

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/update")
    // @APIResponses({
    //         @APIResponse(responseCode = "200", description = "List customers", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = Customer.class))),
    //         @APIResponse(responseCode = "500", description = "Unable to list customers", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    // })
    public Response update() {
        logger.info("update");
        try {
            updaterService.update();
            return Response.ok().entity("Updating...").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    // the new application starts
    // in the main (before quarkus.run) check the if it is a temp application (in temp folder)
    // if it a temp application clone the temp application and paste in the current application
    // 
}
