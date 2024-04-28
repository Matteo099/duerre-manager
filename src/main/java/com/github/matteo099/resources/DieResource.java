package com.github.matteo099.resources;

import java.util.NoSuchElementException;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.jboss.logging.Logger;

import com.github.matteo099.model.dao.DieDao;
import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.entities.DieSearch;
import com.github.matteo099.model.projections.DieSearchResult;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.model.wrappers.IdWrapper;
import com.github.matteo099.model.wrappers.MessageWrapper;
import com.github.matteo099.services.DieService;

import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/die-controller")
public class DieResource {

    @Inject
    DieService dieService;

    @Inject
    Logger logger;

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/create-die")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Die created", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = IdWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to create die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response createDie(DieDao die) {
        try {
            logger.info("creating die");
            String id = dieService.createDie(die);
            dieService.new RandomDieService().saveRamdonDies(20);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/edit-die")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Die modified", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = IdWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to modify die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response editDie(DieDao die) {
        try {
            logger.info("editing die");
            String id = dieService.editDie(die);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list-dies")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "List dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = Die.class))),
            @APIResponse(responseCode = "500", description = "Unable to list dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response listDies() {
        try {
            logger.info("listing dies");
            var dies = dieService.listDies();
            logger.info(dies.size());
            return Response.ok().entity(dies).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/die/{id}")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Get die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = Die.class))),
            @APIResponse(responseCode = "404", description = "Die not found", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to get die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getDie(String id) {
        try {
            logger.info("finding die with id " + id);
            return Response.ok().entity(dieService.findDie(id).orElseThrow()).build();
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return Response.status(404).entity(ErrorWrapper.of(e)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/delete-die/{id}")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Delete die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = MessageWrapper.class))),
            //@APIResponse(responseCode = "404", description = "Die not found", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class))),
            @APIResponse(responseCode = "500", description = "Unable to delete die", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response deleteDie(String id) {
        try {
            logger.info("deleting die with id " + id);
            return Response.ok().entity(MessageWrapper.of(dieService.deleteDie(id))).build();
        } /*catch (NoSuchElementException e) {
            e.printStackTrace();
            return Response.status(404).entity(ErrorWrapper.of(e)).build();
        }*/ catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/search-dies")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Search dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = DieSearchResult.class))),
            @APIResponse(responseCode = "500", description = "Unable to search dies", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response searchDies(DieSearchDao searchDieDao,
            @QueryParam("threshold") @DefaultValue("1000.0") Float threshold) {
        try {
            logger.info("searching dies (with threshold " + threshold + "): " + searchDieDao.toString());
            var dies = dieService.searchDies(searchDieDao, threshold);
            return Response.ok().entity(dies).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/searches")
    @APIResponses({
            @APIResponse(responseCode = "200", description = "Get searches", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(type = SchemaType.ARRAY, implementation = DieSearch.class))),
            @APIResponse(responseCode = "500", description = "Unable to get searches", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(implementation = ErrorWrapper.class)))
    })
    public Response getSearches(@QueryParam("pageSize") @DefaultValue("15") Integer pageSize) {
        try {
            logger.info("finding last " + pageSize + " searches");
            return Response.ok().entity(dieService.getSearches(pageSize)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }
}
