package com.github.matteo099.resources;

import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestStreamElementType;

import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.updater.UpdateAvailable;
import com.github.matteo099.updater.UpdateStatus;
import com.github.matteo099.updater.UpdaterService;

import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/updater-controller")
public class UpdaterResource {

    @Inject
    UpdaterService updaterService;

    @Inject
    Logger logger;

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/update")
    // @APIResponses({
    // @APIResponse(responseCode = "200", description = "List customers", content =
    // @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type =
    // SchemaType.ARRAY, implementation = Customer.class))),
    // @APIResponse(responseCode = "500", description = "Unable to list customers",
    // content = @Content(mediaType = MediaType.APPLICATION_JSON, schema =
    // @Schema(implementation = ErrorWrapper.class)))
    // })
    public Response update() {
        logger.info("update");
        try {
            var updating = updaterService.update(false);
            return Response.ok()
                    .entity(updating ? "Aggiornamento in corso..." : "Impossibile effettuare l'aggiornamento...")
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/check-update")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Check if update is available", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UpdateAvailable.class))),
            @APIResponse(responseCode = "500", description = "Unable to check for updates", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response checkForUpdates() {
        logger.info("Check for updates...");
        try {
            var updateAvailable = updaterService.updateAvailable();
            logger.info(updateAvailable.isAvailable() ? "Update available! (" + updateAvailable.getVersion() + ")"
                    : "Up to date!");
            return Response.ok().entity(updateAvailable).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/status")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Check if update is available", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = UpdateStatus.class))),
            @APIResponse(responseCode = "500", description = "Unable to check for updates", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response updateStatus() {
        logger.info("updateStatus");
        try {
            var status = updaterService.getUpdateStatus();
            return Response.ok().entity(status).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/ack-error")
    public Response ackUpdateError() {
        logger.info("ackUpdateError");
        try {
            updaterService.resetUpdate();
            return Response.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Path("/sse")
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    // @APIResponses({
    // @APIResponse(responseCode = "200", description = "Check if update is
    // available", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema
    // = @Schema(implementation = Boolean.class))),
    // })
    public Multi<UpdateStatus> updateProgress() {
        try {
            return updaterService.getStream();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
