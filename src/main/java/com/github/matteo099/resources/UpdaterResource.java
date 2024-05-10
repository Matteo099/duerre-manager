package com.github.matteo099.resources;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.SubmissionPublisher;
import java.util.concurrent.TimeUnit;

import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestStreamElementType;

import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.updater.AppLifecycleBean;
import com.github.matteo099.updater.UpdaterService;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.smallrye.mutiny.Multi;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

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
            var updating = updaterService.update(true);
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
            @APIResponse(responseCode = "200", description = "Check if update is available", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Boolean.class))),
            @APIResponse(responseCode = "500", description = "Unable to check for updates", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response checkForUpdates() {
        logger.info("checkForUpdates");
        try {
            var updateAvailable = updaterService.updateAvailable();
            return Response.ok().entity(updateAvailable).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    SSEServiceTest sseServiceTest = new SSEServiceTest();

    @GET
    @Path("sse")
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    private Multi<UPD> updateProgress() {
        sseServiceTest.start();
        return sseServiceTest.getStream();
    }

    @RegisterForReflection
    @Getter
    @Setter
    @Builder
    public static class UPD {
        String t;
    }

    public static class SSEServiceTest {
        // https://github.dev/auryn31/server-sent-event-quarkus
        // https://quarkus.io/guides/rest#server-sent-event-sse-support
        // https://stackoverflow.com/questions/61380899/how-to-forward-incoming-data-via-rest-to-an-sse-stream-in-quarkus
        // https://stackoverflow.com/questions/75175435/multi-publisher
        SubmissionPublisher<UPD> flowPublisher = new SubmissionPublisher<UPD>();

        boolean started = false;

        public void pushDeviceStatus(UPD deviceStatus) {
            flowPublisher.submit(deviceStatus);
        }

        public Multi<UPD> getStream() {
            return Multi.createFrom().publisher(flowPublisher);
        }

        public void start() {
            if (started)
                return;
            started = true;

            Runnable helloRunnable = new Runnable() {
                public void run() {
                    pushDeviceStatus(UPD.builder().t("Testttt").build());
                }
            };
            ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
            executor.scheduleAtFixedRate(helloRunnable, 0, 1, TimeUnit.SECONDS);
        }
    }

}
