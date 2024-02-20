package com.github.matteo099.resources;

import java.util.List;

import org.jboss.logging.Logger;

import com.github.matteo099.model.DieDraw;
import com.github.matteo099.model.dao.DieDao;
import com.github.matteo099.model.wrappers.ErrorWrapper;
import com.github.matteo099.model.wrappers.IdWrapper;
import com.github.matteo099.opencv.ShapeMatcher;
import com.github.matteo099.services.DieService;

import jakarta.inject.Inject;
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
    ShapeMatcher shapeMatcher;

    @Inject
    DieService dieService;

    @Inject
    Logger logger;

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/similar-dies")
    public List<DieDraw> getSimilarDies(DieDraw dieDraw,
            @QueryParam("threshold") @DefaultValue(value = "0.1") Float threshold) {
        return shapeMatcher.findSimilarShapes(dieDraw, threshold);
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/create-die")
    public Response createDie(DieDao die) {
        try {
            logger.info("creating die");
            Long id = dieService.createDie(die);
            return Response.ok().entity(IdWrapper.of(id)).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().entity(ErrorWrapper.of(e)).build();
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list-dies")
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
}
